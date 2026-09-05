"""Chat endpoints.

GET  /conversations                        - current user's conversations, newest activity first
GET  /conversations/{id}/messages          - one thread, marks incoming messages as read
POST /conversations/{id}/messages          - send a message
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.conversation import Conversation, ConversationMember
from app.models.message import Message
from app.schemas.chat import ConversationRead, MessageCreate, MessageRead

router = APIRouter()


def _load_conversation(conversation_id: int, user_id: int, session: Session) -> Conversation:
    """Return a conversation the user belongs to, else 404."""
    conversation = session.exec(
        select(Conversation)
        .options(selectinload(Conversation.members))
        .where(Conversation.id == conversation_id)
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    member = session.get(ConversationMember, (conversation_id, user_id))
    if not member:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/conversations", response_model=list[ConversationRead])
def list_conversations(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every conversation the user is in, with the other party's profile,
    the last message preview, and the unread count."""
    membership = session.exec(
        select(ConversationMember).where(ConversationMember.user_id == current_user_id)
    ).all()
    if not membership:
        return []

    conversation_ids = [m.conversation_id for m in membership]
    conversations = session.exec(
        select(Conversation)
        .options(selectinload(Conversation.members), selectinload(Conversation.messages))
        .where(col(Conversation.id).in_(conversation_ids))
    ).all()

    result = []
    for conversation in conversations:
        others = [m for m in conversation.members if m.id != current_user_id]
        other = others[0] if others else None
        last = conversation.messages[-1] if conversation.messages else None
        unread = sum(
            1 for m in conversation.messages if m.sender_id != current_user_id and not m.is_read
        )
        result.append(
            ConversationRead(
                id=conversation.id,
                other=other,
                preview=last.text if last else None,
                unread=unread,
                last_message_at=last.created_at if last else None,
            )
        )

    result.sort(key=lambda c: c.last_message_at or c.created_at, reverse=True)
    return result


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageRead])
def get_messages(
    conversation_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return the full thread, oldest first, and mark the other party's messages as read."""
    conversation = _load_conversation(conversation_id, current_user_id, session)
    messages = session.exec(
        select(Message)
        .options(selectinload(Message.sender))
        .where(Message.conversation_id == conversation.id, Message.sender_id != current_user_id, Message.is_read == False)  # noqa: E712
    ).all()
    for message in messages:
        message.is_read = True
    if messages:
        session.commit()

    return session.exec(
        select(Message)
        .options(selectinload(Message.sender))
        .where(Message.conversation_id == conversation.id)
        .order_by(col(Message.created_at).asc(), col(Message.id).asc())
    ).all()


@router.post("/conversations/{conversation_id}/messages", response_model=MessageRead, status_code=201)
def send_message(
    conversation_id: int,
    payload: MessageCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Append a message to a conversation the user is in."""
    conversation = _load_conversation(conversation_id, current_user_id, session)
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    message = Message(conversation_id=conversation.id, sender_id=current_user_id, text=text)
    session.add(message)
    session.commit()
    session.refresh(message)
    return message

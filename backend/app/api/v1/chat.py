"""Chat thread listing.

Messages themselves are ephemeral and travel over WebSocket/Redis, so there is
no message history to read here. These routes only shape the conversation list
(the DM thread rows) so the app has something to navigate.

GET  /chat/conversations            - current user's threads, most recent first
GET  /chat/conversations/{id}/peer  - the other party in a thread
GET  /chat/people                   - every Connection, plus their shared thread if any
GET  /ws/conversations/{a}/{b}      - find or create a thread between two Connections
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.conversation import Conversation, ConversationMember
from app.models.follow import Follow
from app.models.user import User
from app.schemas.chat import ConversationRead, PersonChat
from app.schemas.user import UserRead

router = APIRouter()


@router.get("/people", response_model=list[PersonChat])
def list_people(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every Connection of the current user, with their shared thread.

    A Connection is a mutual follow. The thread id is present when a 1:1
    conversation already exists; otherwise the client can create one on demand
    when the person opens a chat.
    """
    following = {
        row.followed_id
        for row in session.exec(
            select(Follow).where(Follow.follower_id == current_user_id)
        ).all()
    }
    followed_by = {
        row.follower_id
        for row in session.exec(
            select(Follow).where(Follow.followed_id == current_user_id)
        ).all()
    }
    connection_ids = following & followed_by
    if not connection_ids:
        return []

    users = session.exec(select(User).where(col(User.id).in_(connection_ids))).all()
    by_id = {u.id: u for u in users}

    my_rooms = {
        m.conversation_id
        for m in session.exec(
            select(ConversationMember).where(ConversationMember.user_id == current_user_id)
        ).all()
    }

    result = []
    for other_id in connection_ids:
        theirs = {
            m.conversation_id
            for m in session.exec(
                select(ConversationMember).where(ConversationMember.user_id == other_id)
            ).all()
        }
        shared = my_rooms & theirs
        user = by_id.get(other_id)
        if user is None:
            continue
        result.append(
            PersonChat(
                conversation_id=next(iter(shared)) if shared else None,
                user=user,
            )
        )
    return result


@router.get("/conversations", response_model=list[ConversationRead])
def list_conversations(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every thread the user is in, with the other party's profile."""
    membership = session.exec(
        select(ConversationMember).where(ConversationMember.user_id == current_user_id)
    ).all()
    if not membership:
        return []

    conversation_ids = [m.conversation_id for m in membership]
    conversations = session.exec(
        select(Conversation)
        .options(selectinload(Conversation.members))
        .where(col(Conversation.id).in_(conversation_ids))
    ).all()

    result = []
    for conversation in conversations:
        others = [m for m in conversation.members if m.id != current_user_id]
        result.append(
            ConversationRead(
                id=conversation.id,
                other=others[0] if others else None,
                preview=None,
                unread=0,
                last_message_at=None,
            )
        )

    return result


@router.get("/conversations/{conversation_id}/peer", response_model=UserRead)
def get_peer(
    conversation_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return the other party in a thread the user belongs to."""
    member = session.get(ConversationMember, (conversation_id, current_user_id))
    if not member:
        raise HTTPException(status_code=404, detail="Conversation not found")

    other = session.exec(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id != current_user_id,
        )
    ).first()
    if not other:
        raise HTTPException(status_code=404, detail="Peer not found")

    user = session.get(User, other.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Peer not found")
    return user

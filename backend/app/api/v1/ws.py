"""Ephemeral real-time messaging over WebSocket.

WS /ws/{user_id}?token=<jwt>

Connection lifecycle:
  1. Verify the JWT belongs to the path user_id, then register them online.
  2. Replay any queued offline payloads oldest-first, so nothing waits.
  3. Forward incoming messages to the recipient's live socket, or drop them
     into the recipient's offline mailbox when they are away.
  4. On disconnect, deregister the user so future senders queue instead.

No message content is persisted anywhere. Every routed message is guarded in
PostgreSQL first: a sender may only reach someone they are a Connection with
(mutual follow).
"""

import json

import jwt
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select

from app.core.config import settings
from app.core.realtime import (
    is_online,
    queue_offline,
    register_offline,
    register_online,
    replay_offline,
)
from app.db.session import engine
from app.models.conversation import Conversation, ConversationMember
from app.models.follow import Follow

router = APIRouter()

# user_id -> active WebSocket. In-process only; fine for a single API container.
_sockets: dict[int, WebSocket] = {}


def _verify_token(token: str) -> int | None:
    """Decode the JWT and return its user id, or None if invalid."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        subject = int(payload["sub"])
        return subject if subject > 0 else None
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None


def _is_connection(session: Session, a_id: int, b_id: int) -> bool:
    """True when a and b follow each other, i.e. they are a Connection."""
    a_follows = {row.followed_id for row in session.exec(select(Follow).where(Follow.follower_id == a_id))}
    b_follows = {row.followed_id for row in session.exec(select(Follow).where(Follow.follower_id == b_id))}
    return a_id in b_follows and b_id in a_follows


def _shared_conversation(session: Session, a_id: int, b_id: int) -> int | None:
    """Return the 1:1 conversation id a and b share, else None."""
    a_rooms = {row.conversation_id for row in session.exec(select(ConversationMember).where(ConversationMember.user_id == a_id))}
    b_rooms = {row.conversation_id for row in session.exec(select(ConversationMember).where(ConversationMember.user_id == b_id))}
    shared = a_rooms & b_rooms
    return next(iter(shared)) if shared else None


def _guard(session: Session, sender_id: int, recipient_id: int) -> bool:
    """PostgreSQL access guard: sender may only reach accepted Connections."""
    return _is_connection(session, sender_id, recipient_id)


@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: str):
    """The live chat socket. token is the user's JWT, passed as a query param."""
    caller_id = _verify_token(token)
    if caller_id is None or caller_id != user_id:
        await websocket.close(code=4401)
        return

    await websocket.accept()
    register_online(user_id)
    _sockets[user_id] = websocket

    try:
        for payload in replay_offline(user_id):
            await websocket.send_text(json.dumps(payload))

        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if message.get("type") != "message":
                continue

            to_user_id = message.get("to")
            if not isinstance(to_user_id, int) or to_user_id == user_id:
                continue

            with Session(engine) as session:
                if not _guard(session, user_id, to_user_id):
                    continue

            recipient = _sockets.get(to_user_id)
            if recipient is not None:
                await recipient.send_text(raw)
            elif is_online(to_user_id):
                continue
            else:
                queue_offline(to_user_id, message)
    except WebSocketDisconnect:
        pass
    finally:
        _sockets.pop(user_id, None)
        register_offline(user_id)


@router.get("/conversations/{a_id}/{b_id}")
def get_or_create_conversation(a_id: int, b_id: int):
    """Return the shared conversation id for two Connections, creating it if
    needed so the app can open a thread to chat with any Connection.

    Message delivery itself stays on the WebSocket; this thread row only holds
    the membership used by the chat list.
    """
    with Session(engine) as session:
        if not _is_connection(session, a_id, b_id):
            raise HTTPException(status_code=403, detail="Not a connection")
        existing = _shared_conversation(session, a_id, b_id)
        if existing is not None:
            return {"conversation_id": existing}
        conversation = Conversation()
        session.add(conversation)
        session.flush()
        session.add(ConversationMember(conversation_id=conversation.id, user_id=a_id))
        session.add(ConversationMember(conversation_id=conversation.id, user_id=b_id))
        session.commit()
        return {"conversation_id": conversation.id}

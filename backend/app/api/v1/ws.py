"""Ephemeral real-time messaging over WebSocket.

WS /ws/{user_id}?token=<jwt>

Connection lifecycle:
  1. Verify the JWT belongs to the path user_id, then register them online.
  2. Replay any queued offline payloads oldest-first, so nothing waits.
  3. Forward incoming messages to recipients' live sockets, or drop them into
     the recipients' offline mailboxes when they are away. Offline recipients
     also get an OS push notification via Expo's push service.
  4. On disconnect, deregister the user so future senders queue instead.

Two message shapes are routed here, both guarded in PostgreSQL before any
delivery:
  - Direct message: `{type, from, to, conversation_id, text, created_at}`.
    Sender may only reach someone they are a Connection with (mutual follow).
  - Group message: `{type, from, group_id, text, created_at}`. Sender must be a
    GroupMember of the group. Delivered to every online member, queued for the
    rest, and enriched with the sender's display name so clients can label it.

No message content is persisted anywhere.
"""

import asyncio
import json
import threading

import jwt
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select

from app.core.config import settings
from app.core.push import send_push
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
from app.models.group import Group, GroupMember
from app.models.notification import Notification
from app.models.push_token import PushToken
from app.models.user import User

router = APIRouter()

# user_id -> active WebSocket. In-process only; fine for a single API container.
_sockets: dict[int, WebSocket] = {}

# The app's main event loop, captured at startup. Sync endpoints run on a
# thread pool with no running loop, so they hand ws sends to this loop instead.
_app_loop: asyncio.AbstractEventLoop | None = None


def set_app_loop(loop: asyncio.AbstractEventLoop) -> None:
    """Remember the app's main loop for scheduling socket sends from threads."""
    global _app_loop
    _app_loop = loop


def _deliver_socket(recipient: WebSocket, payload: dict) -> None:
    """Best-effort live frame to a connected socket from any thread.

    Works both inside async websocket handlers (running loop present) and from
    sync FastAPI endpoints (bounces onto the app loop via a threadsafe call).
    """
    frame = json.dumps(payload)
    try:
        asyncio.get_running_loop()
        asyncio.create_task(recipient.send_text(frame))
    except RuntimeError:
        if _app_loop is not None:
            asyncio.run_coroutine_threadsafe(recipient.send_text(frame), _app_loop)


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
    a_follows = {
        row.followed_id
        for row in session.exec(select(Follow).where(Follow.follower_id == a_id))
    }
    b_follows = {
        row.followed_id
        for row in session.exec(select(Follow).where(Follow.follower_id == b_id))
    }
    return a_id in b_follows and b_id in a_follows


def _shared_conversation(session: Session, a_id: int, b_id: int) -> int | None:
    """Return the 1:1 conversation id a and b share, else None."""
    a_rooms = {
        row.conversation_id
        for row in session.exec(select(ConversationMember).where(ConversationMember.user_id == a_id))
    }
    b_rooms = {
        row.conversation_id
        for row in session.exec(select(ConversationMember).where(ConversationMember.user_id == b_id))
    }
    shared = a_rooms & b_rooms
    return next(iter(shared)) if shared else None


def _is_group_member(session: Session, user_id: int, group_id: int) -> bool:
    """True when the user belongs to the given group (group message guard)."""
    return session.get(GroupMember, (group_id, user_id)) is not None


def _group_member_ids(session: Session, group_id: int) -> list[int]:
    """Return every member id of a group."""
    rows = session.exec(select(GroupMember).where(GroupMember.group_id == group_id)).all()
    return [row.user_id for row in rows]


def _push(
    user_id: int,
    title: str,
    body: str,
    data: dict,
    channel: str | None = None,
    category: str | None = None,
) -> None:
    """Best-effort OS push to a user's device: no token means no notification."""
    with Session(engine) as session:
        token = session.exec(select(PushToken).where(PushToken.user_id == user_id)).first()
    if token is None:
        return
    # The Expo HTTP call can take seconds; keep it off the caller's loop or thread.
    threading.Thread(
        target=send_push,
        args=(token.token, title, body, data),
        kwargs={"channel": channel, "category": category},
        daemon=True,
    ).start()


def _notify_push(recipient_id: int, message: dict) -> None:
    """Push a queued chat message; data.url deep-links back into the thread."""
    sender = message.get("from_name") or "Someone"
    text = message.get("text") or ("Photo" if message.get("media_url") else "New message")
    if message.get("group_id") is not None:
        thread_url = f"/chat/{message['group_id']}?kind=group"
    else:
        thread_url = f"/chat/{message.get('conversation_id')}?kind=dm"
    _push(recipient_id, sender, text or "New message", {"url": thread_url}, channel="messages")


def notify(
    session: Session,
    user_id: int,
    type: str,
    *,
    actor: User | None = None,
    entity_id: int | None = None,
    payload: dict | None = None,
    body: str = "",
    url: str = "/notifications",
    channel: str | None = None,
    category: str | None = None,
) -> Notification | None:
    """Record a notification for user_id and deliver it.

    body is the full sentence the page shows. The row is the source of truth
    for the notifications page. An open socket gets a live `notification`
    frame; otherwise the device gets an OS push. A user is never notified about
    their own action.
    """
    if actor is not None and actor.id == user_id:
        return None
    data = {"text": body, "url": url, **(payload or {})}
    if actor is not None:
        data["actor_name"] = actor.display_name or actor.username
        data["actor_avatar_url"] = actor.avatar_url
    row = Notification(
        user_id=user_id,
        type=type,
        actor_id=actor.id if actor else None,
        entity_id=entity_id,
        payload=data,
    )
    session.add(row)
    session.commit()
    session.refresh(row)

    recipient = _sockets.get(user_id)
    if recipient is not None:
        frame = {"type": "notification", "notification": row.model_dump(mode="json")}
        _deliver_socket(recipient, frame)
    else:
        push_data = {"url": url}
        if type == "referral":
            push_data["referralId"] = entity_id
        _push(user_id, "Wuzy", body, push_data, channel, category)
    return row


def _send_or_queue(payload: dict, recipient_id: int) -> None:
    """Deliver a payload to a live socket, else queue it for the offline mailbox.

    Offline recipients also get an OS notification so they know they missed a
    message while outside the chat screens.
    """
    recipient = _sockets.get(recipient_id)
    if recipient is not None:
        # Fire-and-forget to avoid blocking this reader on a slow client.
        _deliver_socket(recipient, payload)
    elif not is_online(recipient_id):
        queue_offline(recipient_id, payload)
        _notify_push(recipient_id, payload)


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
        # Replay anything that queued while the user was away.
        for payload in replay_offline(user_id):
            await websocket.send_text(json.dumps(payload))

        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if message.get("type") not in ("message", "voice_note"):
                continue

            with Session(engine) as session:
                if message.get("group_id") is not None:
                    # Route through the group, guarding membership in Postgres.
                    group_id = message["group_id"]
                    if not _is_group_member(session, user_id, group_id):
                        continue
                    sender = session.get(User, user_id)
                    message["from_name"] = (
                        sender.display_name or sender.username if sender else None
                    )
                    members = _group_member_ids(session, group_id)
                    for member_id in members:
                        if member_id != user_id:
                            _send_or_queue(message, member_id)
                else:
                    # Route a 1:1 direct message, guarding the Connection in Postgres.
                    to_user_id = message.get("to")
                    if not isinstance(to_user_id, int) or to_user_id == user_id:
                        continue
                    if not _is_connection(session, user_id, to_user_id):
                        continue
                    sender = session.get(User, user_id)
                    message["from_name"] = (
                        sender.display_name or sender.username if sender else None
                    )
                    _send_or_queue(message, to_user_id)
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


@router.get("/groups/{group_id}/members")
def list_group_members(group_id: int):
    """Return the member ids of a group, used by the create/join UI."""
    with Session(engine) as session:
        return {"members": _group_member_ids(session, group_id)}


@router.get("/groups/{group_id}/exists")
def group_exists(group_id: int):
    """Confirm a group exists so the client can tell a group thread apart."""
    with Session(engine) as session:
        return {"exists": session.get(Group, group_id) is not None}

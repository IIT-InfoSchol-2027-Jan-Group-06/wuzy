"""Request/response schemas for chat, the conversation and message endpoints.

ConversationRead flattens a conversation into a single row for the chat list:
the other user's profile, the last message preview, and the unread count.
This avoids the client having to compute those itself.
"""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserRead


class MessageCreate(BaseModel):
    """Payload for sending a message. Just the text; sender is derived from the JWT."""

    text: str


class MessageRead(BaseModel):
    """A message as returned by the API.

    Includes the nested sender so the chat UI can render avatars and names
    without a second lookup.
    """

    id: int
    conversation_id: int
    sender_id: int
    text: str
    is_read: bool
    created_at: datetime
    sender: UserRead | None = None

    model_config = {"from_attributes": True}


class ConversationRead(BaseModel):
    """A conversation as shown in the chat list.

    'other' is the other participant (populated server-side by filtering out
    the current user from the member list). 'unread' counts messages sent by
    the other party that have not been marked as read yet.
    """

    id: int
    other: UserRead | None = None
    preview: str | None = None
    unread: int = 0
    last_message_at: datetime | None = None


class PersonChat(BaseModel):
    """A Connection and the thread the current user can chat in, if one exists."""

    conversation_id: int | None = None
    user: UserRead

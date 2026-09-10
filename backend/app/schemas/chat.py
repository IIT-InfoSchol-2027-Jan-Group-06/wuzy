"""Request/response schemas for chat, the conversation and message endpoints."""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserRead


class ConversationRead(BaseModel):
    """A conversation as shown in the chat list."""

    id: int
    other: UserRead | None = None
    preview: str | None = None
    unread: int = 0
    last_message_at: datetime | None = None


class PersonChat(BaseModel):
    """A Connection and the thread the current user can chat in, if one exists."""

    conversation_id: int | None = None
    user: UserRead

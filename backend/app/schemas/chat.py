"""Request/response schemas for chat, the conversation and message endpoints."""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserRead


class MessageCreate(BaseModel):
    text: str


class MessageRead(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    text: str
    is_read: bool
    created_at: datetime
    sender: UserRead | None = None

    model_config = {"from_attributes": True}


class ConversationRead(BaseModel):
    """A conversation as shown in the chat list."""

    id: int
    other: UserRead | None = None
    preview: str | None = None
    unread: int = 0
    last_message_at: datetime | None = None

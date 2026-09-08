from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.conversation import Conversation
    from app.models.user import User


class Message(SQLModel, table=True):
    """A single chat message in a conversation.

    is_read is indexed so the unread count query (WHERE is_read = False)
    stays fast even as message volume grows.
    """

    __tablename__ = "message"

    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    sender_id: int = Field(foreign_key="user.id", index=True)
    text: str
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    conversation: "Conversation" = Relationship(back_populates="messages")
    sender: "User" = Relationship(back_populates="sent_messages")

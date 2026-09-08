from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.message import Message
    from app.models.user import User


class Conversation(SQLModel, table=True):
    """A chat between two or more users. 1:1 DMs for now; the shape allows groups later.

    Members are linked through the conversation_member join table so the
    many-to-many relationship stays explicit and queryable.
    """

    __tablename__ = "conversation"

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    members: list["User"] = Relationship(
        back_populates="conversations",
        sa_relationship_kwargs={"secondary": "conversation_member"},
    )
    # Ordered by time so the chat UI can grab the latest message without extra sorting.
    messages: list["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"order_by": "[Message.created_at, Message.id]"},
    )


class ConversationMember(SQLModel, table=True):
    """Join row: which users are in which conversation.

    Uses a composite primary key (conversation_id, user_id) so a user cannot
    be added to the same conversation twice.
    """

    __tablename__ = "conversation_member"

    conversation_id: int = Field(foreign_key="conversation.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)

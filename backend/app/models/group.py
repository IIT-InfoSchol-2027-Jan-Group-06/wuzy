from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Group(SQLModel, table=True):
    """A chat group. Structural data only (name + membership); messages are
    ephemeral and travel over WebSocket/Redis, never stored here."""

    __tablename__ = "chat_group"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    created_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    members: list["User"] = Relationship(
        back_populates="groups",
        sa_relationship_kwargs={"secondary": "group_member"},
    )


class GroupMember(SQLModel, table=True):
    """Join row: which users are in which group. Sending into a group requires
    a row here for the sender."""

    __tablename__ = "group_member"

    group_id: int = Field(foreign_key="chat_group.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)

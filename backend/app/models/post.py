from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Post(SQLModel, table=True):
    """A post that can be ephemeral (disappears after view) or permanent (saved to profile)."""

    __tablename__ = "post"

    id: int | None = Field(default=None, primary_key=True)
    media_url: str
    caption: str | None = Field(default=None)
    location: str | None = Field(default=None)
    save_to_profile: bool = Field(default=False, index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    user: Optional["User"] = Relationship(back_populates="posts")  # noqa: F821

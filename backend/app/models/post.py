from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Post(SQLModel, table=True):
    """A post that can be ephemeral (disappears after view) or permanent (saved to profile).

    save_to_profile controls the post's lifetime:
      False (default) = ephemeral. The post shows in followers' feeds until they
        view it, then it vanishes. Think Instagram "Instants".
      True = permanent. The post always appears in the author's profile grid
        and in followers' discover feeds regardless of views.
    """

    __tablename__ = "post"

    id: int | None = Field(default=None, primary_key=True)
    media_url: str
    caption: str | None = Field(default=None)
    location: str | None = Field(default=None)
    # Indexed so the discover query can quickly split posts into ephemeral vs permanent.
    save_to_profile: bool = Field(default=False, index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    user: Optional["User"] = Relationship(back_populates="posts")  # noqa: F821

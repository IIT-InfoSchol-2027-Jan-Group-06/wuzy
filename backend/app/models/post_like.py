from datetime import UTC, datetime

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class PostLike(SQLModel, table=True):
    """One row per user per liked post; unliking deletes it."""

    __tablename__ = "post_like"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_post_like_user_post"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

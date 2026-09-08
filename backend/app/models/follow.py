from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Follow(SQLModel, table=True):
    """Directed follow edge. follower follows followed.

    Follows are one-directional (like Instagram). The discover feed only shows
    posts from people you follow, not the other way around. A unique constraint
    prevents duplicate edges.
    """

    __tablename__ = "follow"

    id: int | None = Field(default=None, primary_key=True)
    follower_id: int = Field(foreign_key="user.id", index=True)
    followed_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Both relationships point at User but carry different FK semantics,
    # so we pin each one explicitly.
    follower: "User" = Relationship(
        back_populates="follows",
        sa_relationship_kwargs={"foreign_keys": "[Follow.follower_id]"},
    )
    followed: "User" = Relationship(
        back_populates="followed_by",
        sa_relationship_kwargs={"foreign_keys": "[Follow.followed_id]"},
    )

    # Prevents the same user from following another twice.
    __table_args__ = (
        UniqueConstraint("follower_id", "followed_id", name="uq_follow_follower_followed"),
    )

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class PostView(SQLModel, table=True):
    """Tracks which users have viewed which posts.

    For ephemeral posts: once a (user_id, post_id) row exists,
    that post is hidden from the user's discover feed.
    """

    __tablename__ = "post_view"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    viewed_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

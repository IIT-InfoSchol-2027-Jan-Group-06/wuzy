from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class PostView(SQLModel, table=True):
    """Tracks which users have viewed which posts.

    This is the mechanism behind ephemeral posts. When a user views a post,
    a row is inserted here. The discover feed query then excludes any ephemeral
    post whose (user_id, post_id) pair exists in this table. Permanent posts
    are unaffected by views and always show in the feed.
    """

    __tablename__ = "post_view"

    id: int | None = Field(default=None, primary_key=True)
    # Indexed to speed up the "which posts has this user seen?" lookup in discover.
    user_id: int = Field(foreign_key="user.id", index=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    viewed_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

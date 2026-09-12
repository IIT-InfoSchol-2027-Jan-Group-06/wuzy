from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class PostView(SQLModel, table=True):
    """Tracks which users have viewed which posts, per app session.

    This is the mechanism behind ephemeral posts. When a user views a post,
    a row is inserted here with the session_id of the app run that recorded it.
    The discover feed query then excludes any ephemeral post whose only views
    belong to a *past* session, so ephemeral posts survive the session in which
    they were viewed and vanish the next time the app is opened. Permanent posts
    are unaffected by views and always show in the feed.
    """

    __tablename__ = "post_view"

    id: int | None = Field(default=None, primary_key=True)
    # Indexed to speed up the "which posts has this user seen?" lookup in discover.
    user_id: int = Field(foreign_key="user.id", index=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    # Which app run recorded the view. Nothing is "unviewed" within its own
    # session; the null/other sessions are what hide a post on the next launch.
    session_id: str | None = Field(default=None)
    viewed_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

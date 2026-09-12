from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Column
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.conversation import Conversation
    from app.models.follow import Follow
    from app.models.group import Group
    from app.models.post import Post
    from app.models.ticket import Award, Ticket


class User(SQLModel, table=True):
    """A Wuzy account. Identity and profile live on the same row.

    We keep email/username unique so login and @handles are globally distinct.
    Hobbies are stored as a JSON array because Postgres JSON columns are
    flexible for small lists and avoids a separate join table for a field
    that is only ever read in bulk on the profile page.
    """

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    display_name: str | None = Field(default=None)
    bio: str | None = Field(default=None)
    hobbies: list[str] | None = Field(default=None, sa_column=Column(JSON))
    avatar_url: str | None = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Each relationship uses explicit foreign_keys because SQLAlchemy cannot
    # disambiguate multiple FK paths to the same target table (User) without help.
    posts: list["Post"] = Relationship(back_populates="user")
    follows: list["Follow"] = Relationship(
        back_populates="follower",
        sa_relationship_kwargs={"foreign_keys": "Follow.follower_id"},
    )
    followed_by: list["Follow"] = Relationship(
        back_populates="followed",
        sa_relationship_kwargs={"foreign_keys": "Follow.followed_id"},
    )
    conversations: list["Conversation"] = Relationship(
        back_populates="members",
        # Many-to-many: resolved through the conversation_member join table.
        sa_relationship_kwargs={"secondary": "conversation_member"},
    )
    groups: list["Group"] = Relationship(
        back_populates="members",
        sa_relationship_kwargs={"secondary": "group_member"},
    )
    tickets: list["Ticket"] = Relationship(back_populates="user")
    awards: list["Award"] = Relationship(back_populates="user")

    @property
    def following_ids(self) -> list[int]:
        """Handy shortcut for feed queries that need the set of followed user IDs."""
        return [f.followed_id for f in self.follows]

from datetime import UTC, datetime

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class Event(SQLModel, table=True):
    """An event on the Explore page, tagged for recommendations.

    tags is a JSON array of interest words (e.g. ["music", "dance"]) that the
    recommendation engine matches against a user's hobbies. The category column
    doubles as the coarsest tag, so an event with only a category match still
    scores. start_time is what splits a feed into "Today" and "Up coming".
    """

    __tablename__ = "event"

    id: int | None = Field(default=None, primary_key=True)
    title: str
    description: str | None = Field(default=None)
    image_url: str | None = Field(default=None)
    host_name: str | None = Field(default=None)
    host_avatar_url: str | None = Field(default=None)
    category: str = Field(index=True)
    tags: list[str] | None = Field(default=None, sa_column=Column(JSON))
    venue: str | None = Field(default=None)
    location: str | None = Field(default=None)
    price: str | None = Field(default=None)
    start_time: datetime = Field(index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class EventEngagement(SQLModel, table=True):
    """A user's signal on an event: a view or a decision to go.

    This is the fuel for the recommendation engine. Each row couples a user to
    an event with a kind ("view" or "going"); the engine weighs these rows by
    how similar the acting user's hobbies are to the requester's, so an event
    heats up for you when people with interests like yours engage with it.
    """

    __tablename__ = "event_engagement"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    event_id: int = Field(foreign_key="event.id", index=True)
    kind: str = Field(default="view")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

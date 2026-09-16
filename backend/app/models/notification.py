from datetime import UTC, datetime

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class Notification(SQLModel, table=True):
    """One row per thing a user should see on the notifications page.

    payload always carries the sentence (text) and a deep link (url), plus the
    actor's name and avatar when another user caused it. Type-specific extras
    (referral status, other recipient name) live there too, so the table never
    grows a column per notification kind.
    """

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    type: str
    actor_id: int | None = Field(default=None, foreign_key="user.id")
    entity_id: int | None = Field(default=None)
    payload: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    read_at: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC), index=True)

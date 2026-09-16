from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Ticket(SQLModel, table=True):
    """A ticket a user holds, bought or gifted. event_id is null for legacy rows."""

    __tablename__ = "ticket"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    ticket_type: str = Field(default="standard")
    purchased_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    award_granted: bool = Field(default=False)
    event_id: int | None = Field(default=None, foreign_key="event.id")
    gifted_by: int | None = Field(default=None, foreign_key="user.id")


class Award(SQLModel, table=True):
    """The XP ledger: one row per claimed quest tier. badge_id is set on the final tier only."""

    __tablename__ = "award"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    award_type: str = Field(default="")
    tier: int | None = Field(default=None)
    reward_xp: int = Field(default=0)
    badge_id: int | None = Field(default=None, index=True)
    awarded_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    user: "User" = Relationship(back_populates="awards")

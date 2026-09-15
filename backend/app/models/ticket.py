from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Ticket(SQLModel, table=True):
    """A ticket purchased by a user. Each purchase grants an award."""

    __tablename__ = "ticket"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    ticket_type: str = Field(default="standard")
    purchased_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    award_granted: bool = Field(default=False)

    user: "User" = Relationship(back_populates="tickets")


class Award(SQLModel, table=True):
    """An award granted to a user for completing an action."""

    __tablename__ = "award"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    award_type: str = Field(default="ticket_purchase")
    reward_xp: int = Field(default=0)
    badge_id: int | None = Field(default=None, index=True)
    awarded_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    user: "User" = Relationship(back_populates="awards")

from datetime import datetime

from pydantic import BaseModel


class TicketRead(BaseModel):
    """A ticket as returned by API responses."""

    id: int
    user_id: int
    ticket_type: str
    purchased_at: datetime
    award_granted: bool

    model_config = {"from_attributes": True}


class AwardRead(BaseModel):
    """An award as returned by API responses."""

    id: int
    user_id: int
    award_type: str
    reward_xp: int
    awarded_at: datetime

    model_config = {"from_attributes": True}


class TicketPurchaseResponse(BaseModel):
    """Returned after a successful ticket purchase."""

    ticket: TicketRead
    award: AwardRead | None = None

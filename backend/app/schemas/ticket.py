from datetime import datetime

from pydantic import BaseModel, Field


class TicketEvent(BaseModel):
    """The slice of an event a ticket card needs."""

    id: int
    title: str
    image_url: str | None = None
    start_time: datetime
    venue: str | None = None
    location: str | None = None

    model_config = {"from_attributes": True}


class TicketRead(BaseModel):
    id: int
    user_id: int
    ticket_type: str
    purchased_at: datetime
    event_id: int | None = None
    gifted_by: int | None = None
    event: TicketEvent | None = None

    model_config = {"from_attributes": True}


class TicketPurchase(BaseModel):
    event_id: int | None = None
    quantity: int = Field(default=1, ge=1, le=10)


class TicketGift(BaseModel):
    to_user_id: int
    event_id: int


class AwardRead(BaseModel):
    id: int
    user_id: int
    award_type: str
    tier: int | None = None
    reward_xp: int
    badge_id: int | None = None
    awarded_at: datetime

    model_config = {"from_attributes": True}

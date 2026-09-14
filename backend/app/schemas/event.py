from datetime import datetime

from pydantic import BaseModel


class EventEngageCreate(BaseModel):
    """Signal a client sends for an event.

    kind is "view" when a card scrolls into view and "going" when a user RSVPs.
    Views are cheap curiosity, going is a firm signal, so the engine weights
    them differently.
    """

    kind: str = "view"


class EventRead(BaseModel):
    """An event plus why the recommendation engine ranked it where it did.

    score is the blended weight of interest match, tribe heat and global
    popularity; reason names the dominant signal so the UI can label a card
    ("Matched to you", "Trending", "Discover").
    """

    id: int
    title: str
    description: str | None = None
    image_url: str | None = None
    host_name: str | None = None
    host_avatar_url: str | None = None
    category: str
    tags: list[str] = []
    venue: str | None = None
    location: str | None = None
    price: str | None = None
    start_time: datetime
    created_at: datetime
    score: float = 0.0
    reason: str = "discover"

    model_config = {"from_attributes": True}

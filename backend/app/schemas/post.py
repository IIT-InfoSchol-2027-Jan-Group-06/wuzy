"""Request/response schemas for the Post feed API."""

from datetime import datetime

from pydantic import BaseModel


class PostCreate(BaseModel):
    """Payload for creating a new post."""

    media_url: str
    caption: str | None = None
    save_to_profile: bool = False


class PostRead(BaseModel):
    """Serialized post returned in API responses."""

    id: int
    media_url: str
    caption: str | None = None
    save_to_profile: bool
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class FeedResponse(BaseModel):
    """Envelope for paginated feed results."""

    posts: list[PostRead]
    next_cursor: int | None = None

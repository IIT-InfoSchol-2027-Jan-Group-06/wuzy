"""Request/response schemas for the Post feed API.

Schemas decouple the API contract from the database model. If we rename or
restructure a column later, we only need to adjust the schema mapping, not
every client that consumes the response.
"""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserRead


class PostCreate(BaseModel):
    """Payload for creating a new post.

    save_to_profile defaults to False (ephemeral). The client explicitly
    opts in to permanence when the user toggles the "save to profile" switch.
    """

    media_url: str
    caption: str | None = None
    location: str | None = None
    save_to_profile: bool = False


class PostRead(BaseModel):
    """Serialized post returned in API responses.

    Includes the nested author (user) so the client avoids a second request
    to resolve who posted it. from_attributes allows direct ORM-to-Pydantic
    conversion.
    """

    id: int
    media_url: str
    caption: str | None = None
    location: str | None = None
    save_to_profile: bool
    user_id: int
    created_at: datetime
    user: UserRead | None = None

    model_config = {"from_attributes": True}


class FeedResponse(BaseModel):
    """Envelope for paginated feed results.

    Currently unused (the discover endpoint returns a flat list), but
    reserved for cursor-based pagination when the feed grows.
    """

    posts: list[PostRead]
    next_cursor: int | None = None

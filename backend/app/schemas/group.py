"""Request/response schemas for group chat."""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserRead


class GroupCreate(BaseModel):
    """Payload to create a group. creator is added automatically."""

    name: str
    member_ids: list[int] = []


class GroupRead(BaseModel):
    """A group as shown in the chat list / thread header."""

    id: int
    name: str
    created_by: int
    created_at: datetime
    members: list[UserRead] = []

    model_config = {"from_attributes": True}

"""Request/response schemas for the Awards & Badges API."""

from pydantic import BaseModel


class BadgeRead(BaseModel):
    """A badge as returned by the API."""

    id: int
    name: str
    image_url: str
    is_unlocked: bool

    model_config = {"from_attributes": True}


class TaskRead(BaseModel):
    """A task with its progress, status, and action metadata."""

    id: int
    title: str
    current_progress: int
    target_progress: int
    progress_unit: str
    status: str
    action_type: str
    badge_image_url: str

    model_config = {"from_attributes": True}


class AwardsDashboard(BaseModel):
    """Full dashboard payload for the Awards & Badges page."""

    badges: list[BadgeRead]
    tasks: list[TaskRead]
    ready_count: int


class TaskClaimResponse(BaseModel):
    """Returned after a successful task claim."""

    id: int
    status: str
    badge_unlocked: bool

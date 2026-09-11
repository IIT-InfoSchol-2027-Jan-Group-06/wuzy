"""Request/response schemas for the quest API."""

from pydantic import BaseModel


class QuestRead(BaseModel):
    """A task with its counter, target and derived claim state."""

    id: int
    name: str
    description: str
    reward_name: str
    reward_xp: int
    reward_sticker: bool
    target_count: int
    progress_unit: str
    current_progress: int
    claimed: bool


class QuestsDashboard(BaseModel):
    """Full task list payload."""

    quests: list[QuestRead]
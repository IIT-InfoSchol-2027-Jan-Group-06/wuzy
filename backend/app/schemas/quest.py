"""Request/response schemas for the quest chain API."""

from pydantic import BaseModel


class QuestLevelRead(BaseModel):
    """One level of a quest chain, with the caller's derived status.

    status is one of LOCKED / UNLOCKED / COMPLETED / CLAIMED and drives
    how the quest card renders the level.
    """

    id: int
    level_number: int
    target_count: int
    goal_text: str
    reward_name: str
    reward_xp: int
    reward_sticker: bool
    status: str


class QuestRead(BaseModel):
    """A quest chain with its levels and the caller's progress."""

    id: int
    name: str
    description: str
    current_progress: int
    total_xp: int
    levels: list[QuestLevelRead]


class QuestsDashboard(BaseModel):
    """Full quest chain dashboard payload."""

    quests: list[QuestRead]


class QuestClaimResponse(BaseModel):
    """Returned after claiming a completed level's reward."""

    quest_id: int
    level_id: int
    level_number: int
    status: str
    reward_name: str
    reward_xp: int
    reward_sticker: bool
    total_xp: int
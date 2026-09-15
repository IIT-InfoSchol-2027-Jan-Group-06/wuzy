"""Response schemas for the quest dashboard."""

from pydantic import BaseModel


class TierRead(BaseModel):
    id: int
    name: str
    target_count: int
    progress_unit: str
    reward_xp: int
    current_progress: int
    claimed: bool


class QuestRead(BaseModel):
    key: str
    name: str
    description: str
    category: str
    sort_order: int
    badge_id: int | None
    tiers: list[TierRead]
    active_tier_index: int | None
    claimable: bool
    completed: bool


class XpRead(BaseModel):
    total_xp: int
    rank: str
    rank_index: int
    next_rank: str | None
    rank_threshold: int
    next_threshold: int | None


class QuestsDashboard(BaseModel):
    """Everything the Awards tab needs in one response."""

    xp: XpRead
    deck: list[int]
    quests: list[QuestRead]

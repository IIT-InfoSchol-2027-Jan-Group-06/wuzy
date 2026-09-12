"""Request/response schemas for the quest API."""

from pydantic import BaseModel


class QuestSubtaskRead(BaseModel):
    """A single subtask inside a task with the caller's progress."""

    id: int
    name: str
    description: str
    target_count: int
    progress_unit: str
    reward_xp: int
    reward_sticker: bool
    current_progress: int
    claimed: bool


class QuestRead(BaseModel):
    """A task with the user's active subtask (first unclaimed one).

    active_subtask is None once every subtask has been claimed, meaning the
    whole task is finished. subtask_step is the 1-based position of the
    active subtask within the task and subtask_total the subtask count.
    claimed_steps counts the subtasks the user has already claimed, so the
    frontend can award the task's sticker the first time a step is claimed.
    """

    id: int
    name: str
    description: str
    active_subtask: QuestSubtaskRead | None
    subtask_step: int
    subtask_total: int
    claimed_steps: int


class QuestsDashboard(BaseModel):
    """Full task list payload."""

    quests: list[QuestRead]

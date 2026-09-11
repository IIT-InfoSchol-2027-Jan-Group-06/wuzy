"""Progress calculation helpers for the quest chain system.

Status is derived from QuestProgress so the UI never reads a stored value
that could go stale. A level is:
  CLAIMED: its reward was already claimed.
  COMPLETED: progress hit the target, reward claimable.
  UNLOCKED: reachable (level 1, or the previous level's target was met).
  LOCKED: the previous level's target has not been met yet.
"""

from app.models.quest import QuestLevel

STATUS_CLAIMED = "CLAIMED"
STATUS_COMPLETED = "COMPLETED"
STATUS_UNLOCKED = "UNLOCKED"
STATUS_LOCKED = "LOCKED"


def compute_level_status(
    current_progress: int,
    claimed_level: int,
    level_number: int,
    prev_target: int | None,
    target_count: int,
) -> str:
    """Derive a level's status from the user's progress and claims."""
    if level_number <= claimed_level:
        return STATUS_CLAIMED
    if current_progress >= target_count:
        return STATUS_COMPLETED
    if prev_target is None or current_progress >= prev_target:
        return STATUS_UNLOCKED
    return STATUS_LOCKED


def claimed_xp(claimed_level: int, levels: list[QuestLevel]) -> int:
    """Total XP earned from every claimed level in a chain."""
    return sum(level.reward_xp for level in levels if level.level_number <= claimed_level)
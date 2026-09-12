from sqlmodel import Field, SQLModel


class Quest(SQLModel, table=True):
    """A parent task holding an ordered list of subtasks.

    The task itself carries no counter or reward; those live on its
    subtasks. Each subtask is completed with a single claim click once its
    counter has reached its target, moving the user to the next one. The
    final subtask's claim grants the task reward.
    """

    __tablename__ = "quest"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str
    sort_order: int = Field(default=0)


class QuestSubtask(SQLModel, table=True):
    """A single difficulty tier inside a task.

    Tiers are worked through in order: the user sees only the first
    unclaimed one and incrementing a counter (via API bump) fills it.
    Once the counter reaches the target the claim button appears, and
    clicking it marks the subtask claimed and advances to the next one.
    """

    __tablename__ = "quest_subtask"

    id: int | None = Field(default=None, primary_key=True)
    quest_id: int = Field(foreign_key="quest.id", index=True)
    name: str
    description: str
    target_count: int = Field(default=1)
    progress_unit: str = Field(default="actions")
    reward_xp: int = Field(default=0)
    reward_sticker: bool = Field(default=False)
    sort_order: int = Field(default=0)


class QuestSubtaskProgress(SQLModel, table=True):
    """Per-user progress through a single subtask.

    current_progress increments on each bump (capped at the subtask's
    target_count server-side) and claimed flips true when the user clicks
    Claim, advancing to the next subtask.
    """

    __tablename__ = "quest_subtask_progress"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    subtask_id: int = Field(foreign_key="quest_subtask.id", index=True)
    current_progress: int = Field(default=0)
    claimed: bool = Field(default=False)

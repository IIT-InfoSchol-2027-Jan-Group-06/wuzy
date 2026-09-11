from sqlmodel import Field, SQLModel


class Quest(SQLModel, table=True):
    """A flat task with a progress counter and a single reward.

    There are no levels or sub-milestones. A task completes when the user's
    counter reaches target_count, which flips the task to claimed and grants
    the reward automatically.
    """

    __tablename__ = "quest"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str
    reward_name: str
    reward_xp: int = Field(default=0)
    reward_sticker: bool = Field(default=False)
    target_count: int = Field(default=1)
    progress_unit: str = Field(default="actions")
    sort_order: int = Field(default=0)


class QuestProgress(SQLModel, table=True):
    """Per-user progress through a task.

    current_progress counts the user's performed actions toward the task's
    target. claimed flips true when the user presses Claim on a completed
    task, granting the reward. completing the target alone just unlocks the
    Claim step, so the claim flow stays testable.
    """

    __tablename__ = "quest_progress"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    quest_id: int = Field(foreign_key="quest.id", index=True)
    current_progress: int = Field(default=0)
    claimed: bool = Field(default=False)
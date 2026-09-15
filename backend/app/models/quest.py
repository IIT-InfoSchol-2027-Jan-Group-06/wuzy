from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class Quest(SQLModel, table=True):
    """A quest line: an ordered list of tiers the user works through.

    key is the stable id code uses ("social_network"); name is what the app
    shows. sort_order is also the quest's slot in the user's badge deck.
    """

    __tablename__ = "quest"

    id: int | None = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True)
    name: str
    description: str
    category: str = Field(default="social")
    sort_order: int = Field(default=0)


class QuestSubtask(SQLModel, table=True):
    """One tier of a quest. Tiers are claimed in sort_order; the last one grants the badge."""

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
    """A user's counter and claim flag for one tier. Written only by record() and claim."""

    __tablename__ = "quest_subtask_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "subtask_id", name="uq_quest_subtask_progress_user_subtask"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    subtask_id: int = Field(foreign_key="quest_subtask.id", index=True)
    current_progress: int = Field(default=0)
    claimed: bool = Field(default=False)

from sqlmodel import Field, Relationship, SQLModel


class QuestLevel(SQLModel, table=True):
    """One step in a quest chain, with its target count and reward.

    level_number is the position within the chain (1-based). A level is
    claimable only after the previous level was claimed, so progression
    always happens in order.
    """

    __tablename__ = "quest_level"

    id: int | None = Field(default=None, primary_key=True)
    quest_id: int = Field(foreign_key="quest.id", index=True)
    level_number: int
    target_count: int
    goal_text: str
    reward_name: str
    reward_xp: int = Field(default=0)
    reward_sticker: bool = Field(default=False)


class Quest(SQLModel, table=True):
    """A quest chain: sequential levels that unlock as the level before is completed."""

    __tablename__ = "quest"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str
    sort_order: int = Field(default=0)

    levels: list["QuestLevel"] = Relationship(
        sa_relationship_kwargs={"order_by": "QuestLevel.level_number", "lazy": "selectin"}
    )


class QuestProgress(SQLModel, table=True):
    """Per-user progress through a quest chain.

    current_progress counts the user's actions toward the quest's goal.
    claimed_level holds the highest level number whose reward was claimed;
    0 means nothing claimed yet. Status per level is derived from these two
    values, so it never goes stale.
    """

    __tablename__ = "quest_progress"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    quest_id: int = Field(foreign_key="quest.id", index=True)
    current_progress: int = Field(default=0)
    claimed_level: int = Field(default=0)
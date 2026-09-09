from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """A progress-tracked task on the Awards & Badges board.

    progress_unit uses a small vocabulary so the frontend can pick the right
    label: "completed", "friends", "shared".
    status drives the UI action button: CLAIMABLE shows a claim button,
    IN_PROGRESS shows progress, CLAIMED shows a checkmark.
    action_type tells the frontend what the button does: CLAIM, ADD, SHARE.
    """

    __tablename__ = "task"

    id: int | None = Field(default=None, primary_key=True)
    title: str
    current_progress: int = Field(default=0)
    target_progress: int
    progress_unit: str
    status: str = Field(default="IN_PROGRESS")
    action_type: str
    badge_image_url: str

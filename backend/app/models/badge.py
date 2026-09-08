from sqlmodel import Field, SQLModel


class Badge(SQLModel, table=True):
    """An achievement badge displayed on the Awards & Badges board.

    is_unlocked is global for now (all users see the same unlock state).
    """

    __tablename__ = "badge"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    image_url: str
    is_unlocked: bool = Field(default=False)

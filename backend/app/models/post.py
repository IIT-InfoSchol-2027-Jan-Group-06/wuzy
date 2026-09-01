from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    content: str
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="posts")

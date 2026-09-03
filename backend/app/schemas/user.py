from datetime import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    username: str
    hashed_password: str
    avatar_url: str | None = None


class UserRead(BaseModel):
    id: int
    email: str
    username: str
    avatar_url: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

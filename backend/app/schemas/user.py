from datetime import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    username: str
    hashed_password: str
    display_name: str | None = None
    bio: str | None = None
    hobbies: list[str] | None = None
    avatar_url: str | None = None


class UserRead(BaseModel):
    id: int
    email: str
    username: str
    display_name: str | None = None
    bio: str | None = None
    hobbies: list[str] | None = None
    avatar_url: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

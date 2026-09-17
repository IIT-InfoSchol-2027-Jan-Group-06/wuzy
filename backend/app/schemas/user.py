from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Incoming payload for account registration.

    hashed_password is the field name for consistency with the model,
    but the client sends a plaintext password that gets hashed server-side.
    """

    email: EmailStr
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-z0-9_.]+$")
    hashed_password: str = Field(min_length=8)
    display_name: str | None = None
    bio: str | None = None
    hobbies: list[str] | None = None
    avatar_url: str | None = None
    gender: str | None = None
    birthday: date | None = None


class UserRead(BaseModel):
    """User as returned by API responses.

    Never exposes the hashed password. from_attributes lets Pydantic
    read directly from a SQLModel row without manual dict conversion.
    """

    id: int
    email: str
    username: str
    display_name: str | None = None
    bio: str | None = None
    hobbies: list[str] | None = None
    avatar_url: str | None = None
    gender: str | None = None
    birthday: date | None = None
    is_active: bool
    created_at: datetime
    tickets_count: int = 0
    awards_count: int = 0
    total_xp: int = 0
    badge_deck: list[int] | None = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Editable profile fields. Only the fields sent are changed."""

    display_name: str | None = None
    bio: str | None = None
    hobbies: list[str] | None = None
    avatar_url: str | None = None


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """Returned after a successful login. The frontend stores access_token
    in secure storage and keeps the user object for immediate display.
    """

    access_token: str
    token_type: str = "bearer"
    user: UserRead

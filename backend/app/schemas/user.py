from datetime import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    """Incoming payload for account registration.

    hashed_password is the field name for consistency with the model,
    but the client sends a plaintext password that gets hashed server-side.
    """

    email: str
    username: str
    hashed_password: str
    display_name: str | None = None
    bio: str | None = None
    hobbies: list[str] | None = None
    avatar_url: str | None = None


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
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
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

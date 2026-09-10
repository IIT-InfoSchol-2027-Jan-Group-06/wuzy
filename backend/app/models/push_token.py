from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class PushToken(SQLModel, table=True):
    """An Expo push token registered by a user's device."""

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, unique=True)
    token: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

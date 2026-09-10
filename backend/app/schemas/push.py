from pydantic import BaseModel


class PushTokenRegister(BaseModel):
    """An Expo push token from a client device."""

    token: str

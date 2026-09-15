from datetime import datetime

from pydantic import BaseModel


class NotificationRead(BaseModel):
    id: int
    type: str
    actor_id: int | None = None
    entity_id: int | None = None
    payload: dict
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}

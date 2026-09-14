"""Request/response schemas for referrals."""

from datetime import datetime

from pydantic import BaseModel


class ReferralCreate(BaseModel):
    """A referral: the two users being introduced to each other (not the sender)."""

    first_user_id: int
    second_user_id: int


class ReferralRead(BaseModel):
    """A referral as the client sees it, with resolved display names.

    Both recipients and both statuses are included because every viewer renders
    a different sentence: each recipient sees themselves referred to the other,
    and the sender sees who has already responded and who it is still waiting on.
    """

    id: int
    sender_id: int
    first_user_id: int
    second_user_id: int
    status: str
    first_status: str
    second_status: str
    consumed: bool = False
    created_at: datetime
    sender_name: str | None = None
    first_name: str | None = None
    second_name: str | None = None
    sender_avatar_url: str | None = None


class ReferralRespond(BaseModel):
    """How one recipient replied to a pending referral."""

    accept: bool

"""Request/response schemas for referrals."""

from datetime import datetime

from pydantic import BaseModel


class ReferralCreate(BaseModel):
    """A referral: who is being introduced (referred) and who to (target)."""

    referred_id: int
    target_id: int


class ReferralRead(BaseModel):
    """A referral request as the client sees it, with resolved display names.

    Names are denormalized in because the recipient may not know the target,
    and the refer screen shows who the pending note is waiting on.
    """

    id: int
    sender_id: int
    referred_id: int
    target_id: int
    status: str
    consumed: bool = False
    created_at: datetime
    sender_name: str | None = None
    target_name: str | None = None
    sender_avatar_url: str | None = None


class ReferralRespond(BaseModel):
    """How the referred user replied to a pending referral."""

    accept: bool

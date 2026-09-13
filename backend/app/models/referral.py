from datetime import UTC, datetime

from sqlalchemy import Index, text
from sqlmodel import Field, SQLModel


class ReferralRequest(SQLModel, table=True):
    """A referral: the sender introduces the referred user to the target.

    Sender picks a connection from their Connections screen and describes who
    they should meet (the target, chosen on the refer screen). The referred
    user owns the request: their acceptance or decline resolves it. Only one
    pending request may exist per combo, so the sender can re-send the same
    referral once a previous one is accepted or declined.
    """

    __tablename__ = "referral_request"

    id: int | None = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id", index=True)
    referred_id: int = Field(foreign_key="user.id", index=True)
    target_id: int = Field(foreign_key="user.id")
    status: str = Field(default="pending")
    # True once the sender has finished the resolved-state UI (Done or the
    # declined flash), so the card stops showing the outcome and goes back to
    # the Send Request pill. One-time per referral.
    consumed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    __table_args__ = (
        Index(
            "uq_referral_pending_triple",
            "sender_id",
            "referred_id",
            "target_id",
            unique=True,
            postgresql_where=text("status = 'pending'"),
        ),
    )

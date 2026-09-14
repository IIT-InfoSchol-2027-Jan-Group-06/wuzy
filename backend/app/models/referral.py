from datetime import UTC, datetime

from sqlalchemy import Index, text
from sqlmodel import Field, SQLModel


class ReferralRequest(SQLModel, table=True):
    """A referral: the sender introduces two of their connections to each other.

    Sender picks one connection on their Connections screen, chooses a second
    on the refer screen, and both recipients independently accept or decline.
    The referral becomes a real connection (mutual follow) only when both
    accept; one decline voids the whole thing. Recipient ids are kept sorted so
    a pending request is unique per sender-pair, whichever direction the two
    were picked in.
    """

    __tablename__ = "referral_request"

    id: int | None = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id", index=True)
    first_user_id: int = Field(foreign_key="user.id", index=True)
    second_user_id: int = Field(foreign_key="user.id")
    first_status: str = Field(default="pending")
    second_status: str = Field(default="pending")
    # Overall status derived from the two: 'pending' while either side is
    # unresolved (covers the partially-accepted state), 'accepted' when both
    # accept, 'declined' the moment either declines.
    status: str = Field(default="pending")
    # True once the sender has finished the resolved-state UI (the 1s outcome
    # flash), so the card stops showing it and goes back to the Send Request
    # pill. One-time per referral.
    consumed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    __table_args__ = (
        Index(
            "uq_referral_pending_sender_pair",
            "sender_id",
            "first_user_id",
            "second_user_id",
            unique=True,
            postgresql_where=text("status = 'pending'"),
        ),
    )

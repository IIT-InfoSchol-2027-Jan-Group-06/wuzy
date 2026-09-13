"""allow resend of a referral after it is resolved

Only one pending request per sender/referred/target combo now; once the most
recent request is accepted or declined a new one may be sent, so the old
full-triple unique constraint is replaced by a partial unique index on rows
that are still pending.

Revision ID: f1b2c3d4e5f6
Revises: f0a1b2c3d4e5
Create Date: 2026-09-12 16:30:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f1b2c3d4e5f6"
down_revision: str | None = "f0a1b2c3d4e5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint(
        "uq_referral_sender_referred_target", "referral_request", type_="unique"
    )
    op.create_index(
        "uq_referral_pending_triple",
        "referral_request",
        ["sender_id", "referred_id", "target_id"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )


def downgrade() -> None:
    op.drop_index("uq_referral_pending_triple", table_name="referral_request")
    op.create_unique_constraint(
        "uq_referral_sender_referred_target",
        "referral_request",
        ["sender_id", "referred_id", "target_id"],
    )

"""add consumed flag to referral_request

A resolved referral stops driving the sender's card once the sender has
finished its resolved-state UI (Done on the QR screen, or the declined flash),
so the card returns to the Send Request pill. This flag marks that transition.

Revision ID: a2b3c4d5e6f7
Revises: f1b2c3d4e5f6
Create Date: 2026-09-13 12:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a2b3c4d5e6f7"
down_revision: str | None = "f1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "referral_request",
        sa.Column(
            "consumed", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )


def downgrade() -> None:
    op.drop_column("referral_request", "consumed")

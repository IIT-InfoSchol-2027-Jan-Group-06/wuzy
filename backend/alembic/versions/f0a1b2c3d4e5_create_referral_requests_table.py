"""create referral_request table

Revision ID: f0a1b2c3d4e5
Revises: e5f6a7b8c9d0
Create Date: 2026-09-12 16:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f0a1b2c3d4e5"
down_revision: str | None = "e5f6a7b8c9d0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "referral_request",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("referred_id", sa.Integer(), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["referred_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["target_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "sender_id",
            "referred_id",
            "target_id",
            name="uq_referral_sender_referred_target",
        ),
    )
    op.create_index(
        "ix_referral_request_sender_id", "referral_request", ["sender_id"], unique=False
    )
    op.create_index(
        "ix_referral_request_referred_id", "referral_request", ["referred_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_referral_request_referred_id", table_name="referral_request")
    op.drop_index("ix_referral_request_sender_id", table_name="referral_request")
    op.drop_table("referral_request")

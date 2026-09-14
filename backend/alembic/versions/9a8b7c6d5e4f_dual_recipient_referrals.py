"""redefine referral_request for two independent recipients

A referral now introduces two of the sender's connections to each other, and
each recipient accepts or declines independently. The old single-recipient
shape (referred_id/target_id plus one shared status) cannot map onto that, and
existing rows are only manual test data, so the table is dropped and recreated.

Revision ID: 9a8b7c6d5e4f
Revises: 76d61b0e0b2d
Create Date: 2026-09-14 09:30:00

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9a8b7c6d5e4f"
down_revision: str | None = "76d61b0e0b2d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_index("uq_referral_pending_triple", table_name="referral_request")
    op.drop_index("ix_referral_request_sender_id", table_name="referral_request")
    op.drop_index("ix_referral_request_referred_id", table_name="referral_request")
    op.drop_table("referral_request")

    op.create_table(
        "referral_request",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("first_user_id", sa.Integer(), nullable=False),
        sa.Column("second_user_id", sa.Integer(), nullable=False),
        sa.Column("first_status", sa.String(), nullable=False),
        sa.Column("second_status", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("consumed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["first_user_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["second_user_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_referral_request_sender_id", "referral_request", ["sender_id"], unique=False
    )
    op.create_index(
        "ix_referral_request_first_user_id",
        "referral_request",
        ["first_user_id"],
        unique=False,
    )
    op.create_index(
        "uq_referral_pending_sender_pair",
        "referral_request",
        ["sender_id", "first_user_id", "second_user_id"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )


def downgrade() -> None:
    op.drop_index("uq_referral_pending_sender_pair", table_name="referral_request")
    op.drop_index("ix_referral_request_first_user_id", table_name="referral_request")
    op.drop_index("ix_referral_request_sender_id", table_name="referral_request")
    op.drop_table("referral_request")

    op.create_table(
        "referral_request",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("referred_id", sa.Integer(), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("consumed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["referred_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["target_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_referral_request_sender_id", "referral_request", ["sender_id"], unique=False
    )
    op.create_index(
        "ix_referral_request_referred_id",
        "referral_request",
        ["referred_id"],
        unique=False,
    )
    op.create_index(
        "uq_referral_pending_triple",
        "referral_request",
        ["sender_id", "referred_id", "target_id"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )

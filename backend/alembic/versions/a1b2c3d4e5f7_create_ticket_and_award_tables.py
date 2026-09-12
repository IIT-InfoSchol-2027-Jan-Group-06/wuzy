"""Create ticket and award tables.

Revision ID: a1b2c3d4e5f7
Revises: f7b8c9d0e1f2
Create Date: 2026-09-12 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f7"
down_revision: str | None = "9e8d7c6b5a40"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ticket",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("ticket_type", sa.String(), nullable=False, server_default="standard"),
        sa.Column("purchased_at", sa.DateTime(), nullable=False),
        sa.Column("award_granted", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ticket_user_id", "ticket", ["user_id"])
    op.create_table(
        "award",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("award_type", sa.String(), nullable=False, server_default="ticket_purchase"),
        sa.Column("reward_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("awarded_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_award_user_id", "award", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_award_user_id", table_name="award")
    op.drop_table("award")
    op.drop_index("ix_ticket_user_id", table_name="ticket")
    op.drop_table("ticket")

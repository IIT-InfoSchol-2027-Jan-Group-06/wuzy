"""add badge and task tables

Revision ID: c5d6e7f8a9b0
Revises: b4c5d6e7f8a9
Create Date: 2026-09-08 12:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c5d6e7f8a9b0"
down_revision: str | None = "b4c5d6e7f8a9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # -- badge table --
    op.create_table(
        "badge",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("image_url", sa.String(), nullable=False),
        sa.Column("is_unlocked", sa.Boolean(), nullable=False, server_default="false"),
        sa.PrimaryKeyConstraint("id"),
    )

    # -- task table --
    op.create_table(
        "task",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("current_progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("target_progress", sa.Integer(), nullable=False),
        sa.Column("progress_unit", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="IN_PROGRESS"),
        sa.Column("action_type", sa.String(), nullable=False),
        sa.Column("badge_image_url", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("task")
    op.drop_table("badge")

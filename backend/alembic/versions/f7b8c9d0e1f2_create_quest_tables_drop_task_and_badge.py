"""create quest tables, drop task and badge tables

Revision ID: f7b8c9d0e1f2
Revises: e1f2a3b4c5d6
Create Date: 2026-09-11 15:30:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f7b8c9d0e1f2"
down_revision: str | None = "e1f2a3b4c5d6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "quest",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "quest_level",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("quest_id", sa.Integer(), nullable=False),
        sa.Column("level_number", sa.Integer(), nullable=False),
        sa.Column("target_count", sa.Integer(), nullable=False),
        sa.Column("goal_text", sa.String(), nullable=False),
        sa.Column("reward_name", sa.String(), nullable=False),
        sa.Column("reward_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reward_sticker", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["quest_id"], ["quest.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quest_level_quest_id", "quest_level", ["quest_id"])
    op.create_table(
        "quest_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("quest_id", sa.Integer(), nullable=False),
        sa.Column("current_progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("claimed_level", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["quest_id"], ["quest.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quest_progress_quest_id", "quest_progress", ["quest_id"])
    op.create_index("ix_quest_progress_user_id", "quest_progress", ["user_id"])
    op.drop_table("task")
    op.drop_table("badge")


def downgrade() -> None:
    op.create_table(
        "badge",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("image_url", sa.String(), nullable=False),
        sa.Column("is_unlocked", sa.Boolean(), nullable=False, server_default="false"),
        sa.PrimaryKeyConstraint("id"),
    )
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
        sa.Column("batch", sa.Integer(), nullable=False, server_default="1"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.drop_index("ix_quest_progress_user_id", table_name="quest_progress")
    op.drop_index("ix_quest_progress_quest_id", table_name="quest_progress")
    op.drop_table("quest_progress")
    op.drop_table("quest_level")
    op.drop_table("quest")
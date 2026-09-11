"""add quest subtask tables, drop flat quest progress and reward columns

Revision ID: d1e2f3a4b5c6
Revises: c0d1e2f3a4b5
Create Date: 2026-09-11 18:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d1e2f3a4b5c6"
down_revision: str | None = "c0d1e2f3a4b5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "quest_subtask",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("quest_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("target_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("progress_unit", sa.String(), nullable=False, server_default="actions"),
        sa.Column("reward_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reward_sticker", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["quest_id"], ["quest.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quest_subtask_quest_id", "quest_subtask", ["quest_id"])
    op.create_table(
        "quest_subtask_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("subtask_id", sa.Integer(), nullable=False),
        sa.Column("current_progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("claimed", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["subtask_id"], ["quest_subtask.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quest_subtask_progress_subtask_id", "quest_subtask_progress", ["subtask_id"])
    op.create_index("ix_quest_subtask_progress_user_id", "quest_subtask_progress", ["user_id"])

    op.drop_index("ix_quest_progress_quest_id", table_name="quest_progress")
    op.drop_index("ix_quest_progress_user_id", table_name="quest_progress")
    op.drop_table("quest_progress")

    op.drop_column("quest", "target_count")
    op.drop_column("quest", "progress_unit")
    op.drop_column("quest", "reward_sticker")
    op.drop_column("quest", "reward_xp")
    op.drop_column("quest", "reward_name")


def downgrade() -> None:
    op.add_column("quest", sa.Column("reward_name", sa.String(), nullable=False, server_default=""))
    op.add_column("quest", sa.Column("reward_xp", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("quest", sa.Column("reward_sticker", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("quest", sa.Column("progress_unit", sa.String(), nullable=False, server_default="actions"))
    op.add_column("quest", sa.Column("target_count", sa.Integer(), nullable=False, server_default="1"))

    op.create_table(
        "quest_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("quest_id", sa.Integer(), nullable=False),
        sa.Column("current_progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("claimed", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["quest_id"], ["quest.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quest_progress_quest_id", "quest_progress", ["quest_id"])
    op.create_index("ix_quest_progress_user_id", "quest_progress", ["user_id"])

    op.drop_index("ix_quest_subtask_progress_user_id", table_name="quest_subtask_progress")
    op.drop_index("ix_quest_subtask_progress_subtask_id", table_name="quest_subtask_progress")
    op.drop_table("quest_subtask_progress")
    op.drop_index("ix_quest_subtask_quest_id", table_name="quest_subtask")
    op.drop_table("quest_subtask")
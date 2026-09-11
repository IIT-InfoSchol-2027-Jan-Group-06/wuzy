"""flatten quest system: drop levels, add per-quest reward, claimed flag

Revision ID: f0e1d2c3b4a5
Revises: f7b8c9d0e1f2
Create Date: 2026-09-11 16:30:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f0e1d2c3b4a5"
down_revision: str | None = "f7b8c9d0e1f2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("quest", sa.Column("reward_name", sa.String(), nullable=False, server_default=""))
    op.add_column("quest", sa.Column("reward_xp", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("quest", sa.Column("reward_sticker", sa.Boolean(), nullable=False, server_default="false"))

    op.drop_index("ix_quest_level_quest_id", table_name="quest_level")
    op.drop_table("quest_level")

    op.drop_column("quest_progress", "current_progress")
    op.drop_column("quest_progress", "claimed_level")
    op.add_column("quest_progress", sa.Column("claimed", sa.Boolean(), nullable=False, server_default="false"))


def downgrade() -> None:
    op.drop_column("quest_progress", "claimed")
    op.add_column("quest_progress", sa.Column("claimed_level", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("quest_progress", sa.Column("current_progress", sa.Integer(), nullable=False, server_default="0"))

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

    op.drop_column("quest", "reward_sticker")
    op.drop_column("quest", "reward_xp")
    op.drop_column("quest", "reward_name")
"""add task progress counter, targets and units, drop claimed flag

Revision ID: b6a5c4d3e2f1
Revises: f0e1d2c3b4a5
Create Date: 2026-09-11 17:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b6a5c4d3e2f1"
down_revision: str | None = "f0e1d2c3b4a5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("quest", sa.Column("target_count", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("quest", sa.Column("progress_unit", sa.String(), nullable=False, server_default="actions"))
    op.add_column("quest_progress", sa.Column("current_progress", sa.Integer(), nullable=False, server_default="0"))
    op.drop_column("quest_progress", "claimed")


def downgrade() -> None:
    op.add_column("quest_progress", sa.Column("claimed", sa.Boolean(), nullable=False, server_default="false"))
    op.drop_column("quest_progress", "current_progress")
    op.drop_column("quest", "progress_unit")
    op.drop_column("quest", "target_count")
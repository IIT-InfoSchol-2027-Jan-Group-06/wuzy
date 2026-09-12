"""add claimed flag to quest progress for the claim step

Revision ID: c0d1e2f3a4b5
Revises: b6a5c4d3e2f1
Create Date: 2026-09-11 17:30:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c0d1e2f3a4b5"
down_revision: str | None = "b6a5c4d3e2f1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("quest_progress", sa.Column("claimed", sa.Boolean(), nullable=False, server_default="false"))


def downgrade() -> None:
    op.drop_column("quest_progress", "claimed")
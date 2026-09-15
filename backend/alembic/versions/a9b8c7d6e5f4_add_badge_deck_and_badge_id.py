"""add badge deck to user and badge id to award

Revision ID: a9b8c7d6e5f4
Revises: a1b2c3d4e5f8
Create Date: 2026-09-15 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a9b8c7d6e5f4"
down_revision: str | None = "a1b2c3d4e5f8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("user", sa.Column("badge_deck", sa.JSON(), nullable=True))
    op.add_column("award", sa.Column("badge_id", sa.Integer(), nullable=True))
    op.create_index("ix_award_badge_id", "award", ["badge_id"])


def downgrade() -> None:
    op.drop_index("ix_award_badge_id", table_name="award")
    op.drop_column("award", "badge_id")
    op.drop_column("user", "badge_deck")
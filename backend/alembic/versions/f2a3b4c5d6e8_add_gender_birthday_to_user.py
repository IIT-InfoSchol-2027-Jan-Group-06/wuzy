"""add gender and birthday to user

Revision ID: f2a3b4c5d6e8
Revises: d0e1f2a3b4c5
Create Date: 2026-09-17 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f2a3b4c5d6e8"
down_revision: str | None = "d0e1f2a3b4c5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("user", sa.Column("gender", sa.String(), nullable=True))
    op.add_column("user", sa.Column("birthday", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("user", "birthday")
    op.drop_column("user", "gender")

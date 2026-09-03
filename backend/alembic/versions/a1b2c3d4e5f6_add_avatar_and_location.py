"""add avatar_url to user, location to post

Revision ID: a1b2c3d4e5f6
Revises: e8a48b4f4005
Create Date: 2026-09-03 15:30:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "e8a48b4f4005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("user", sa.Column("avatar_url", sa.String(), nullable=True))
    op.add_column("post", sa.Column("location", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("post", "location")
    op.drop_column("user", "avatar_url")

"""merge referral and events branches

Revision ID: 9e8d7c6b5a40
Revises: 9a8b7c6d5e4f, c6d7e8f9a0b1
Create Date: 2026-09-14 00:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "9e8d7c6b5a40"
down_revision: Union[str, None] = ("9a8b7c6d5e4f", "c6d7e8f9a0b1")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
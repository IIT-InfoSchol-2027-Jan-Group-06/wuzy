"""merge badge and referral-events heads

Revision ID: 1a2b3c4d5e6f
Revises: a9b8c7d6e5f4, 9e8d7c6b5a40
Create Date: 2026-09-15 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "1a2b3c4d5e6f"
down_revision: Union[str, None] = ("a9b8c7d6e5f4", "9e8d7c6b5a40")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

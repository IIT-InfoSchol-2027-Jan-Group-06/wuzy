"""merge heads

Revision ID: 76d61b0e0b2d
Revises: a2b3c4d5e6f7, e2f3a4b5c6d7
Create Date: 2026-09-13 06:43:35.078564+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '76d61b0e0b2d'
down_revision: Union[str, None] = ('a2b3c4d5e6f7', 'e2f3a4b5c6d7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
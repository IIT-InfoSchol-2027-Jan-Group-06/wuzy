"""create post_like table

Revision ID: c8d9e0f1a2b3
Revises: b7c8d9e0f1a2
Create Date: 2026-09-15 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c8d9e0f1a2b3"
down_revision: str | None = "b7c8d9e0f1a2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "post_like",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("post_id", sa.Integer(), sa.ForeignKey("post.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "post_id", name="uq_post_like_user_post"),
    )
    op.create_index("ix_post_like_user_id", "post_like", ["user_id"])
    op.create_index("ix_post_like_post_id", "post_like", ["post_id"])


def downgrade() -> None:
    op.drop_index("ix_post_like_post_id", table_name="post_like")
    op.drop_index("ix_post_like_user_id", table_name="post_like")
    op.drop_table("post_like")

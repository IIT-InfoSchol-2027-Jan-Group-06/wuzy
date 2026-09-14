"""create events and event engagement tables

Revision ID: c6d7e8f9a0b1
Revises: e2f3a4b5c6d7
Create Date: 2026-09-14 09:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c6d7e8f9a0b1"
down_revision: str | None = "e2f3a4b5c6d7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "event",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("host_name", sa.String(), nullable=True),
        sa.Column("host_avatar_url", sa.String(), nullable=True),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("venue", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("price", sa.String(), nullable=True),
        sa.Column("start_time", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_event_category"), "event", ["category"], unique=False)
    op.create_index(op.f("ix_event_start_time"), "event", ["start_time"], unique=False)

    op.create_table(
        "event_engagement",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("event_id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["event_id"], ["event.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_event_engagement_user_id"), "event_engagement", ["user_id"], unique=False)
    op.create_index(op.f("ix_event_engagement_event_id"), "event_engagement", ["event_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_event_engagement_event_id"), table_name="event_engagement")
    op.drop_index(op.f("ix_event_engagement_user_id"), table_name="event_engagement")
    op.drop_table("event_engagement")

    op.drop_index(op.f("ix_event_start_time"), table_name="event")
    op.drop_index(op.f("ix_event_category"), table_name="event")
    op.drop_table("event")

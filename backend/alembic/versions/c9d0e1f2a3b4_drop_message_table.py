"""drop message table (messages are now ephemeral via WebSocket/Redis)

Revision ID: c9d0e1f2a3b4
Revises: b4c5d6e7f8a9
Create Date: 2026-09-09 10:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c9d0e1f2a3b4"
down_revision: str | None = "b4c5d6e7f8a9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_table("message")


def downgrade() -> None:
    op.create_table(
        "message",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversation.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_message_sender_id"), "message", ["sender_id"], unique=False)
    op.create_index(op.f("ix_message_is_read"), "message", ["is_read"], unique=False)
    op.create_index(op.f("ix_message_conversation_id"), "message", ["conversation_id"], unique=False)

"""add profile fields, follows, and chats

Revision ID: b4c5d6e7f8a9
Revises: a1b2c3d4e5f6
Create Date: 2026-09-06 01:45:00

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b4c5d6e7f8a9"
down_revision: str | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # -- user profile columns --
    op.add_column("user", sa.Column("display_name", sa.String(), nullable=True))
    op.add_column("user", sa.Column("bio", sa.String(), nullable=True))
    op.add_column("user", sa.Column("hobbies", sa.JSON(), nullable=True))

    # -- follow table --
    op.create_table(
        "follow",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("follower_id", sa.Integer(), nullable=False),
        sa.Column("followed_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["follower_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["followed_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_follow_followed_id"), "follow", ["followed_id"], unique=False)
    op.create_index(op.f("ix_follow_follower_id"), "follow", ["follower_id"], unique=False)
    op.create_unique_constraint("uq_follow_follower_followed", "follow", ["follower_id", "followed_id"])

    # -- conversation and members --
    op.create_table(
        "conversation",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "conversation_member",
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversation.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("conversation_id", "user_id"),
    )

    # -- message table --
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
    op.create_index(op.f("ix_message_conversation_id"), "message", ["conversation_id"], unique=False)
    op.create_index(op.f("ix_message_is_read"), "message", ["is_read"], unique=False)
    op.create_index(op.f("ix_message_sender_id"), "message", ["sender_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_message_sender_id"), table_name="message")
    op.drop_index(op.f("ix_message_is_read"), table_name="message")
    op.drop_index(op.f("ix_message_conversation_id"), table_name="message")
    op.drop_table("message")

    op.drop_table("conversation_member")
    op.drop_table("conversation")

    op.drop_constraint("uq_follow_follower_followed", "follow", type_="unique")
    op.drop_index(op.f("ix_follow_follower_id"), table_name="follow")
    op.drop_index(op.f("ix_follow_followed_id"), table_name="follow")
    op.drop_table("follow")

    op.drop_column("user", "hobbies")
    op.drop_column("user", "bio")
    op.drop_column("user", "display_name")

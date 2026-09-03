"""create user, post, and post_view tables

Revision ID: e8a48b4f4005
Revises:
Create Date: 2026-09-01 17:48:46

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e8a48b4f4005"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # -- user table --
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=True)
    op.create_index(op.f("ix_user_username"), "user", ["username"], unique=True)

    # -- post table --
    op.create_table(
        "post",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("media_url", sa.String(), nullable=False),
        sa.Column("caption", sa.String(), nullable=True),
        sa.Column("save_to_profile", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_post_user_id"), "post", ["user_id"], unique=False)
    op.create_index(op.f("ix_post_save_to_profile"), "post", ["save_to_profile"], unique=False)

    # -- post_view table --
    op.create_table(
        "post_view",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("viewed_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["post_id"], ["post.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_post_view_user_id"), "post_view", ["user_id"], unique=False)
    op.create_index(op.f("ix_post_view_post_id"), "post_view", ["post_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_post_view_post_id"), table_name="post_view")
    op.drop_index(op.f("ix_post_view_user_id"), table_name="post_view")
    op.drop_table("post_view")

    op.drop_index(op.f("ix_post_save_to_profile"), table_name="post")
    op.drop_index(op.f("ix_post_user_id"), table_name="post")
    op.drop_table("post")

    op.drop_index(op.f("ix_user_username"), table_name="user")
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.drop_table("user")

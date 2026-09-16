"""quest catalog: keys, categories, tiers ledger, streaks, ticket events and gifts

Revision ID: d0e1f2a3b4c5
Revises: c8d9e0f1a2b3
Create Date: 2026-09-15 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d0e1f2a3b4c5"
down_revision: str | None = "c8d9e0f1a2b3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

KEY_BY_NAME = {
    "Social Network": "social_network",
    "Ticket Sharing": "ticket_sharing",
    "Daily Login": "daily_streak",
}
KEY_BY_AWARD = {
    **KEY_BY_NAME,
    "ticket_purchase": "ticket_holder",
    "profile_complete": "complete_profile",
}


def _case(column: str, mapping: dict[str, str]) -> str:
    whens = " ".join(f"WHEN '{old}' THEN '{new}'" for old, new in mapping.items())
    return f"CASE {column} {whens} ELSE lower(replace({column}, ' ', '_')) END"


def upgrade() -> None:
    op.add_column("quest", sa.Column("key", sa.String(), nullable=True))
    op.execute(f"UPDATE quest SET key = {_case('name', KEY_BY_NAME)}")
    op.alter_column("quest", "key", nullable=False)
    op.create_index("ix_quest_key", "quest", ["key"], unique=True)
    op.add_column("quest", sa.Column("category", sa.String(), nullable=False, server_default="social"))

    op.execute(
        "DELETE FROM quest_subtask_progress a USING quest_subtask_progress b "
        "WHERE a.id > b.id AND a.user_id = b.user_id AND a.subtask_id = b.subtask_id"
    )
    op.create_unique_constraint(
        "uq_quest_subtask_progress_user_subtask",
        "quest_subtask_progress",
        ["user_id", "subtask_id"],
    )

    op.add_column("ticket", sa.Column("event_id", sa.Integer(), nullable=True))
    op.add_column("ticket", sa.Column("gifted_by", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_ticket_event_id", "ticket", "event", ["event_id"], ["id"])
    op.create_foreign_key("fk_ticket_gifted_by", "ticket", "user", ["gifted_by"], ["id"])

    op.add_column("user", sa.Column("last_login_date", sa.Date(), nullable=True))
    op.add_column(
        "user", sa.Column("login_streak", sa.Integer(), nullable=False, server_default="0")
    )

    op.add_column("award", sa.Column("tier", sa.Integer(), nullable=True))
    op.execute(f"UPDATE award SET award_type = {_case('award_type', KEY_BY_AWARD)}")


def downgrade() -> None:
    op.drop_column("award", "tier")
    op.drop_column("user", "login_streak")
    op.drop_column("user", "last_login_date")
    op.drop_constraint("fk_ticket_gifted_by", "ticket", type_="foreignkey")
    op.drop_constraint("fk_ticket_event_id", "ticket", type_="foreignkey")
    op.drop_column("ticket", "gifted_by")
    op.drop_column("ticket", "event_id")
    op.drop_constraint(
        "uq_quest_subtask_progress_user_subtask", "quest_subtask_progress", type_="unique"
    )
    op.drop_column("quest", "category")
    op.drop_index("ix_quest_key", table_name="quest")
    op.drop_column("quest", "key")

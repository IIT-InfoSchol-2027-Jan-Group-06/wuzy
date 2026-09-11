"""Reset quest progress for testing the claim flow.

Restores every user's quest progress to the fresh-seed demo state: the
Counters are set back (Attend 3, Social 7, Ticket 1) and every task is
unclaimed, so the claim path can be run from the beginning.

Usage:
  python reset_quests.py            # reset all users
  python reset_quests.py --user 5   # reset a single user id
"""

import sys

from sqlmodel import Session, select

from app.db.session import engine
from app.models.quest import Quest, QuestProgress
from app.models.user import User

DEMO_PROGRESS = {
    "Attend Live Events": 3,
    "Social Network": 7,
    "Ticket Sharing": 1,
}


def reset_for(user: User, session: Session) -> int:
    quests = {quest.name: quest for quest in session.exec(select(Quest)).all()}
    count = 0
    for name, current in DEMO_PROGRESS.items():
        quest = quests.get(name)
        if quest is None:
            continue
        row = session.exec(
            select(QuestProgress).where(
                QuestProgress.quest_id == quest.id,
                QuestProgress.user_id == user.id,
            )
        ).first()
        if row is None:
            row = QuestProgress(user_id=user.id, quest_id=quest.id)
            session.add(row)
        row.current_progress = current
        row.claimed = False
        session.add(row)
        count += 1
    return count


def main() -> None:
    user_id: int | None = None
    if "--user" in sys.argv:
        try:
            user_id = int(sys.argv[sys.argv.index("--user") + 1])
        except (ValueError, IndexError):
            print("Usage: python reset_quests.py [--user <id>]")
            sys.exit(1)

    with Session(engine) as session:
        users = session.exec(select(User)).all()
        if user_id is not None:
            users = [user for user in users if user.id == user_id]
        if not users:
            print("No matching users found.")
            sys.exit(1)

        for user in users:
            count = reset_for(user, session)
            print(f"Reset {user.username} (id {user.id}): {count} quests, all unclaimed")
        session.commit()


if __name__ == "__main__":
    main()
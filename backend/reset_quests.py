"""Reset quest progress for testing the claim flow.

Restores every user's quest state to the fresh-seed demo: Attend Live
Events has "Attend 1 Event" at 1/1 (claimable), Social Network has
"Add 3 Friends" at 2/3 (in progress), Ticket Sharing has "Share 1
Ticket" at 1/1 (claimable).  All progress rows are rebuilt from scratch.

Usage:
  python reset_quests.py            # reset all users
  python reset_quests.py --user 5   # reset a single user id
"""

import sys

from sqlmodel import Session, delete, select

from app.db.session import engine
from app.models.quest import Quest, QuestSubtask, QuestSubtaskProgress
from app.models.user import User

# Task name -> subtasks to pre-seed with demo counters.
# Rows for every other subtask are wiped.
DEMO_PROGRESS = {
    "Attend Live Events": [("Attend 1 Event", 1)],
    "Social Network": [("Add 3 Friends", 2)],
    "Ticket Sharing": [("Share 1 Ticket", 1)],
}


def reset_for(user: User, session: Session) -> tuple[int, int]:
    quests = {quest.name: quest for quest in session.exec(select(Quest)).all()}
    claimable = 0
    for quest_name, subtask_progress in DEMO_PROGRESS.items():
        quest = quests.get(quest_name)
        if quest is None:
            continue
        subtasks = session.exec(
            select(QuestSubtask).where(QuestSubtask.quest_id == quest.id)
        ).all()
        for subtask in subtasks:
            target = next((t for n, t in subtask_progress if n == subtask.name), 0)
            session.exec(
                delete(QuestSubtaskProgress).where(
                    QuestSubtaskProgress.subtask_id == subtask.id,
                    QuestSubtaskProgress.user_id == user.id,
                )
            )
            session.add(
                QuestSubtaskProgress(
                    user_id=user.id,
                    subtask_id=subtask.id,
                    current_progress=target,
                    claimed=False,
                )
            )
            if target >= subtask.target_count:
                claimable += 1
    return claimable, len(session.exec(select(QuestSubtask)).all())


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
            claimable, total = reset_for(user, session)
            print(f"Reset {user.username} (id {user.id}): {claimable}/{total} claimable")
        session.commit()


if __name__ == "__main__":
    main()
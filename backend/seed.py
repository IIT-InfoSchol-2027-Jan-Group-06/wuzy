"""Seed database with demo data.

Idempotent: skips if any users exist.
"""

from sqlmodel import Session, select, func

from app.db.session import engine
from app.models.user import User
from app.models.post import Post
from app.models.quest import Quest, QuestSubtask, QuestSubtaskProgress
from sqlmodel import delete


# Demo users
USERS = [
    ("alice", "alice@example.com"),
    ("bob", "bob@example.com"),
]


def seed_users(session: Session) -> None:
    for username, email in USERS:
        exists = session.exec(select(User).where(User.email == email)).first()
        if not exists:
            session.add(User(username=username, email=email, hashed_password="demo"))
    session.commit()


def seed_posts(session: Session) -> None:
    if session.exec(select(func.count(Post.id))).one()[0] > 0:
        return
    users = session.exec(select(User).all()).all()
    if not users:
        return

    demo_posts = [
        {
            "caption": "Golden hour at the rooftop venue",
            "media_url": "https://picsum.photos/seed/post1/800/600",
            "user_id": users[0].id,
        },
        {
            "caption": "Backstage energy is unmatched",
            "media_url": "https://picsum.photos/seed/post2/800/600",
            "user_id": users[0].id,
        },
        {
            "caption": "Crowd was absolutely electric tonight",
            "media_url": "https://picsum.photos/seed/post3/800/600",
            "user_id": users[0].id,
        },
        {
            "caption": "Sunday sunset session",
            "media_url": "https://picsum.photos/seed/post4/800/600",
            "user_id": users[0].id,
        },
        {
            "caption": "Vibes in the warehouse district",
            "media_url": "https://picsum.photos/seed/post5/800/600",
            "user_id": users[1].id,
        },
        {
            "caption": "Warehouse session was unreal",
            "media_url": "https://picsum.photos/seed/post6/800/600",
            "user_id": users[1].id,
        },
        {
            "caption": "This lineup was insane",
            "media_url": "https://picsum.photos/seed/post7/800/600",
            "user_id": users[1].id,
        },
        {
            "caption": "Late night rooftop session",
            "media_url": "https://picsum.photos/seed/post8/800/600",
            "user_id": users[1].id,
        },
    ]
    for post_data in demo_posts:
        session.add(Post(**post_data))
    session.commit()


# Connections: every pair is a DM thread. Messages themselves are ephemeral
# (WebSocket/Redis only), so threads carry membership but no stored content.

# Tasks hold ordered subtasks. Each subtask has its own target, counter unit
# and reward; the user works through them one at a time, claiming each.
# Each entry: (task name, description, [(subtask name, target, unit, xp, sticker), ...])
QUESTS = [
    (
        "Attend Live Events",
        "Go to live events and climb the table.",
        [
            ("Attend 1 Event", 1, "completed", 20, False),
            ("Attend 3 Events", 3, "completed", 50, True),
            ("Attend 5 Events", 5, "completed", 100, True),
        ],
    ),
    (
        "Social Network",
        "Connect with people and grow your circle.",
        [
            ("Add 3 Friends", 3, "friends", 10, False),
            ("Add 5 Friends", 5, "friends", 25, False),
            ("Add 10 Friends", 10, "friends", 50, True),
        ],
    ),
    (
        "Ticket Sharing",
        "Share event tickets with your circle.",
        [
            ("Share 1 Ticket", 1, "tickets", 20, False),
            ("Share 3 Tickets", 3, "tickets", 40, False),
            ("Share 5 Tickets", 5, "tickets", 80, True),
        ],
    ),
]

# Demo progress per task, applied on a fresh seed. Tuples name the subtask
# and its counter: one subtask complete-unclaimed (1/1) so the Claim button
# is immediately testable, the rest mid-way so the bars and counters show.
# Rows are unclaimed on purpose so the claim flow can be run end to end.
# Each entry: (task name, [(subtask name, current_progress), ...])
QUEST_START_PROGRESS = [
    ("Attend Live Events", [("Attend 1 Event", 1)]),
    ("Social Network", [("Add 3 Friends", 2)]),
    ("Ticket Sharing", [("Share 1 Ticket", 1)]),
]


def seed_quests(session: Session) -> None:
    """Sync the task catalog: drop stale subtasks, add missing ones.

    Existing quests and subtasks keep their ids but their display, reward
    and target fields are refreshed from the catalog. Live user progress is
    preserved.
    """
    wanted_names = {quest[0] for quest in QUESTS}
    for stale in session.exec(select(Quest)).all():
        if stale.name not in wanted_names:
            session.delete(stale)
    session.commit()

    for index, (name, description, subtasks) in enumerate(QUESTS):
        quest = session.exec(select(Quest).where(Quest.name == name)).first()
        if quest is None:
            quest = Quest(name=name, description=description, sort_order=index)
            session.add(quest)
        else:
            quest.description = description
            quest.sort_order = index
            session.add(quest)
        session.commit()
        session.refresh(quest)

        wanted_subtasks = {subtask[0] for subtask in subtasks}
        for stale in session.exec(
            select(QuestSubtask).where(QuestSubtask.quest_id == quest.id)
        ).all():
            if stale.name not in wanted_subtasks:
                session.exec(
                    delete(QuestSubtaskProgress).where(QuestSubtaskProgress.subtask_id == stale.id)
                )
                session.delete(stale)
        session.commit()

        for sub_index, (sub_name, target, unit, xp, sticker) in enumerate(subtasks):
            subtask = session.exec(
                select(QuestSubtask).where(
                    QuestSubtask.quest_id == quest.id,
                    QuestSubtask.name == sub_name,
                )
            ).first()
            description = f"Complete {target} {unit} in {name}"
            if subtask is None:
                subtask = QuestSubtask(
                    quest_id=quest.id,
                    name=sub_name,
                    description=description,
                    target_count=target,
                    progress_unit=unit,
                    reward_xp=xp,
                    reward_sticker=sticker,
                    sort_order=sub_index,
                )
                session.add(subtask)
            else:
                subtask.description = description
                subtask.target_count = target
                subtask.progress_unit = unit
                subtask.reward_xp = xp
                subtask.reward_sticker = sticker
                subtask.sort_order = sub_index
                session.add(subtask)
    session.commit()


def seed_quest_progress(session: Session) -> None:
    """Add a demo progress row per subtask for every account, if missing.

    Existing rows keep their live counter and claim flag so a container
    restart never resets what a user already earned.
    """
    users = session.exec(select(User)).all()
    quests = {quest.name: quest for quest in session.exec(select(Quest)).all()}
    for user in users:
        for quest_name, subtask_progress in QUEST_START_PROGRESS:
            quest = quests.get(quest_name)
            if quest is None:
                continue
            for sub_name, current in subtask_progress:
                subtask = session.exec(
                    select(QuestSubtask).where(
                        QuestSubtask.quest_id == quest.id,
                        QuestSubtask.name == sub_name,
                    )
                ).first()
                if subtask is None:
                    continue
                exists = session.exec(
                    select(QuestSubtaskProgress).where(
                        QuestSubtaskProgress.subtask_id == subtask.id,
                        QuestSubtaskProgress.user_id == user.id,
                    )
                ).first()
                if exists is None:
                    session.add(
                        QuestSubtaskProgress(
                            user_id=user.id,
                            subtask_id=subtask.id,
                            current_progress=current,
                            claimed=False,
                        )
                    )
    session.commit()


if __name__ == "__main__":
    with Session(engine) as session:
        count = session.exec(select(func.count(User.id))).one()
        if count > 0:
            print(f"Database already seeded with {count} users, tasks backfilled...")
            seed_quests(session)
            seed_quest_progress(session)
        else:
            print("Database empty, seeding demo data...")
            seed_users(session)
            seed_posts(session)
            seed_quests(session)
            seed_quest_progress(session)
            print("Seed complete.")
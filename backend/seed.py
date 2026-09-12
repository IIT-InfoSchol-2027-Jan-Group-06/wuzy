# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

import shutil
from pathlib import Path

import bcrypt
from sqlmodel import Session, delete, func, select

from app.db.session import engine
from app.models.conversation import Conversation, ConversationMember
from app.models.follow import Follow
from app.models.group import Group, GroupMember
from app.models.post import Post
from app.models.quest import Quest, QuestSubtask, QuestSubtaskProgress
from app.models.user import User

STORAGE_ROOT = Path("storage")
SEED_MEDIA = Path("seed_media")


def hash_password(password: str) -> str:
    # bcrypt directly (passlib 1.7.4 is deprecated and broken with bcrypt 5.x)
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed_media():
    """Copy committed seed images into the storage dir if it is empty."""
    if not SEED_MEDIA.exists():
        return
    for kind in ("post", "avatar"):
        src = SEED_MEDIA / kind
        dst = STORAGE_ROOT / kind
        if not src.is_dir():
            continue
        dst.mkdir(parents=True, exist_ok=True)
        for image in src.iterdir():
            if not image.is_file():
                continue
            target = dst / image.name
            if not target.exists():
                shutil.copy(image, target)


# Demo accounts: (email, password, username, display_name, bio, hobbies, avatar)
ACCOUNTS = [
    (
        "abhiruk@test.com",
        "password123",
        "abhiruk",
        "Abhiruk Prashan",
        "Full-stack dev by day, concert goer by night. I build things and break the dance floor.",
        ["Tech", "Music", "Gaming"],
        "avatar1.png",
    ),
    (
        "ravindu644@test.com",
        "password123",
        "ravindu644",
        "Ravindu Deshan",
        "Fitness nut and runner. Always up for a beach day.",
        ["Fitness", "Sports", "Travel"],
        "avatar2.png",
    ),
    (
        "sethuki@test.com",
        "password123",
        "sethuki",
        "Sethuki Karawita",
        "Designer who sketches between coffee breaks. Obsessed with typography and sunsets.",
        ["Art", "Design", "Reading"],
        "avatar3.png",
    ),
    (
        "azma@test.com",
        "password123",
        "azma",
        "Azma Ashraf",
        "Foodie and travel photographer. I collect stamps in my passport and recipes in my head.",
        ["Food", "Photography", "Travel"],
        "avatar4.png",
    ),
    (
        "charuki@test.com",
        "password123",
        "charuki",
        "Charuki Weheragoda",
        "Music lover, dancer, part-time DJ. Vibes over everything.",
        ["Music", "Dance", "Movies"],
        "avatar5.png",
    ),
]

# Connections: every pair is mutual (each person follows the other).
# Anything one partner posts shows up in the other's feed.
CONNECTIONS = [
    ("abhiruk", "sethuki"),
    ("abhiruk", "charuki"),
    ("abhiruk", "azma"),
    ("ravindu644", "sethuki"),
    ("sethuki", "charuki"),
    ("sethuki", "azma"),
    ("charuki", "ravindu644"),
]

# Posts per user: (media, caption, location, save_to_profile)
POSTS = {
    "abhiruk": [
        ("post1.png", "Golden hour doesn't get better than this", "new york", True),
        ("post3.png", "New setup, who dis", "colombo", True),
        ("event1.png", "Front row for the live set", "colombo", True),
        ("event5.png", "Going live in 10", "colombo", False),
    ],
    "ravindu644": [
        ("post2.png", "Morning run squad", "colombo", True),
        ("event2.png", "Beach clean-up morning", "galle", True),
        ("post4.png", "Post-gym refuel", "colombo", True),
    ],
    "sethuki": [
        ("post4.png", "Sketching the skyline", "kandy", True),
        ("event3.png", "Gallery opening night", "colombo", True),
        ("event7.png", "Print making workshop", "colombo", True),
    ],
    "azma": [
        ("post1,jpeg", "Market colours", "colombo", True),
        ("post1.png", "Market colours", "colombo", True),
        ("event4.png", "Sunrise at the coast", "mirissa", True),
    ],
    "charuki": [
        ("event3.png", "DJ set going off", "colombo", True),
        ("post3.png", "Studio session", "colombo", True),
        ("post2.png", "Grooving on the beach set", "mount lavinia", False),
    ],
}

# Connections: every pair is a DM thread. Messages themselves are ephemeral
# (WebSocket/Redis only), so threads carry membership but no stored content.

def seed():
    seed_media()
    with Session(engine) as session:
        if session.exec(select(User)).first():
            print("Database already seeded, skipping...")
            return

        users = {
            username: User(
                email=email,
                username=username,
                hashed_password=hash_password(password),
                display_name=display_name,
                bio=bio,
                hobbies=hobbies,
                avatar_url=f"/uploads/avatar/{avatar}",
                is_active=True,
            )
            for email, password, username, display_name, bio, hobbies, avatar in ACCOUNTS
        }
        for user in users.values():
            session.add(user)
        session.commit()
        for user in users.values():
            session.refresh(user)

        for first, second in CONNECTIONS:
            session.add(Follow(follower_id=users[first].id, followed_id=users[second].id))
            session.add(Follow(follower_id=users[second].id, followed_id=users[first].id))

        for author_name, posts in POSTS.items():
            for media, caption, location, save_to_profile in posts:
                session.add(
                    Post(
                        media_url=f"/uploads/post/{media}",
                        caption=caption,
                        location=location,
                        save_to_profile=save_to_profile,
                        user_id=users[author_name].id,
                    )
                )

        for first, second in CONNECTIONS:
            conversation = Conversation()
            session.add(conversation)
            session.commit()
            session.refresh(conversation)
            session.add(
                ConversationMember(conversation_id=conversation.id, user_id=users[first].id)
            )
            session.add(
                ConversationMember(conversation_id=conversation.id, user_id=users[second].id)
            )

        # Demo group with several members, giving every account a group chat to test.
        group = Group(name="Weekend Squad", created_by=users["abhiruk"].id)
        session.add(group)
        session.commit()
        session.refresh(group)
        for member_name in ("abhiruk", "sethuki", "charuki", "azma"):
            session.add(
                GroupMember(group_id=group.id, user_id=users[member_name].id)
            )

        session.commit()

        post_count = session.exec(select(Post)).all().__len__()
        conversation_count = session.exec(select(Conversation)).all().__len__()
        group_count = session.exec(select(Group)).all().__len__()
        print("Demo data seeded successfully!")
        print(f"Created users: {', '.join(users)}")
        print(f"Created posts: {post_count}, conversations: {conversation_count}, groups: {group_count}")
        print("Demo logins (password123): abhiruk, ravindu644, sethuki, azma, charuki @test.com")
        print("Backend URL base: http://localhost:8000")

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



def _run_quest_seed() -> None:
    """Seed the quest catalog + demo progress using main's idempotent style.

    Runs on every container start so a DB that rewinds (down -v) gets the
    award page's tasks + demo progress automatically.
    """
    from sqlmodel import Session as _Session

    from app.db.session import engine as _engine

    with _Session(_engine) as _session:
        count = _session.exec(select(func.count(User.id))).one()
        if count > 0:
            seed_quests(_session)
            seed_quest_progress(_session)


seed_quests_if_present = _run_quest_seed

if __name__ == "__main__":
    seed()
    seed_quests_if_present()

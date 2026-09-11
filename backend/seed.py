# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

import shutil
from pathlib import Path

import bcrypt
from sqlmodel import Session, delete, select

from app.db.session import engine
from app.models.conversation import Conversation, ConversationMember
from app.models.follow import Follow
from app.models.group import Group, GroupMember
from app.models.post import Post
from app.models.quest import Quest, QuestProgress
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

# Flat tasks. Each counts performed actions toward a target; reaching the
# target completes the task automatically. Rewards hold the prize granted.
QUESTS = [
    {
        "name": "Attend Live Events",
        "description": "Go to live events and climb the table.",
        "reward_name": "Gold Badge",
        "reward_xp": 50,
        "reward_sticker": True,
        "target_count": 3,
        "progress_unit": "completed",
    },
    {
        "name": "Social Network",
        "description": "Connect with people and grow your circle.",
        "reward_name": "Community Champion Badge",
        "reward_xp": 0,
        "reward_sticker": False,
        "target_count": 10,
        "progress_unit": "friends",
    },
    {
        "name": "Ticket Sharing",
        "description": "Share event tickets with your circle.",
        "reward_name": "Super Promoter Badge",
        "reward_xp": 50,
        "reward_sticker": False,
        "target_count": 2,
        "progress_unit": "tickets",
    },
]

# Demo counter per task, applied on a fresh seed: one task completed (target
# met, unclaimed) so the Claim button is immediately testable, the rest
# mid-way so the bars and counters show. Rows are unclaimed on purpose so the
# claim flow can be run end to end.
# Tuple: (quest name, current_progress, claimed)
QUEST_START_PROGRESS = [
    ("Attend Live Events", 3, False),
    ("Social Network", 7, False),
    ("Ticket Sharing", 1, False),
]


def seed_quests(session: Session) -> None:
    """Sync the task catalog: drop stale quests, add missing ones.

    Existing quests keep their ids but their display, reward and target fields
    are refreshed from the catalog. Live user progress is preserved.
    """
    wanted_names = {quest["name"] for quest in QUESTS}
    for stale in session.exec(select(Quest)).all():
        if stale.name not in wanted_names:
            session.exec(delete(QuestProgress).where(QuestProgress.quest_id == stale.id))
            session.delete(stale)
    session.commit()

    for index, quest in enumerate(QUESTS):
        row = session.exec(select(Quest).where(Quest.name == quest["name"])).first()
        if row is None:
            row = Quest(
                name=quest["name"],
                description=quest["description"],
                reward_name=quest["reward_name"],
                reward_xp=quest["reward_xp"],
                reward_sticker=quest["reward_sticker"],
                target_count=quest["target_count"],
                progress_unit=quest["progress_unit"],
                sort_order=index,
            )
            session.add(row)
        else:
            row.description = quest["description"]
            row.reward_name = quest["reward_name"]
            row.reward_xp = quest["reward_xp"]
            row.reward_sticker = quest["reward_sticker"]
            row.target_count = quest["target_count"]
            row.progress_unit = quest["progress_unit"]
            row.sort_order = index
            session.add(row)
    session.commit()


def seed_quest_progress(session: Session) -> None:
    """Add a demo progress row per task for every account, if missing.

    Existing rows keep their live counter and claim flag so a container
    restart never resets what a user already earned.
    """
    users = session.exec(select(User)).all()
    for user in users:
        for quest_name, current, claimed in QUEST_START_PROGRESS:
            quest = session.exec(select(Quest).where(Quest.name == quest_name)).first()
            if quest is None:
                continue
            exists = session.exec(
                select(QuestProgress).where(
                    QuestProgress.quest_id == quest.id,
                    QuestProgress.user_id == user.id,
                )
            ).first()
            if exists is None:
                session.add(
                    QuestProgress(
                        user_id=user.id,
                        quest_id=quest.id,
                        current_progress=current,
                        claimed=claimed,
                    )
                )
    session.commit()


def seed():
    seed_media()
    with Session(engine) as session:
        if session.exec(select(User)).first():
            # Demo accounts already exist; sync the quest catalog and backfill
            # any missing demo progress rows.
            seed_quests(session)
            seed_quest_progress(session)
            print("Database already seeded, tasks backfilled...")
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

        seed_quests(session)
        seed_quest_progress(session)

        post_count = session.exec(select(Post)).all().__len__()
        conversation_count = session.exec(select(Conversation)).all().__len__()
        group_count = session.exec(select(Group)).all().__len__()
        quest_count = session.exec(select(Quest)).all().__len__()
        progress_count = session.exec(select(QuestProgress)).all().__len__()
        print("Demo data seeded successfully!")
        print(f"Created users: {', '.join(users)}")
        print(f"Created posts: {post_count}, conversations: {conversation_count}, groups: {group_count}")
        print(f"Created quests: {quest_count}, progress rows: {progress_count}")
        print("Demo logins (password123): abhiruk, ravindu644, sethuki, azma, charuki @test.com")
        print("Backend URL base: http://localhost:8000")


if __name__ == "__main__":
    seed()
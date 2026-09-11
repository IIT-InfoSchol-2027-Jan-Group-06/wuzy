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
from app.models.quest import Quest, QuestLevel, QuestProgress
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

# Quest chains. Each entry holds its levels as a tuple of
# (level_number, target_count, goal_text, reward_name, reward_xp, reward_sticker).
# Levels unlock in order: the next only becomes reachable once the previous
# level's target is met.
QUESTS = [
    {
        "name": "Attend Live Events",
        "description": "Go to live events and climb the table.",
        "levels": [
            (1, 1, "Attend 1 Live Event", "Bronze Badge", 50, False),
            (2, 2, "Attend 2 Live Events", "Silver Badge", 100, False),
            (3, 3, "Attend 3 Live Events", "Gold Badge", 0, True),
        ],
    },
    {
        "name": "Social Network",
        "description": "Connect with people and grow your circle.",
        "levels": [
            (1, 3, "Connect with 3 Users", "Starter Badge", 0, False),
            (2, 7, "Connect with 7 Users", "Networker Badge", 0, False),
            (3, 10, "Connect with 10 Users", "Community Champion Badge", 0, False),
        ],
    },
    {
        "name": "Ticket Sharing",
        "description": "Share event tickets with your circle.",
        "levels": [
            (1, 1, "Share 1 Event Ticket", "Promoter Badge", 0, False),
            (2, 2, "Share 2 Event Tickets", "Super Promoter Badge", 50, False),
        ],
    },
]

# Demo starting progress per quest, applied on a fresh seed. Values are chosen
# to show every level state at once: a claimed reward, a completed one ready
# to claim (Ticket Sharing), and an in-progress level.
# Tuple: (quest name, current_progress, claimed_level)
QUEST_START_PROGRESS = [
    ("Attend Live Events", 2, 1),
    ("Social Network", 7, 1),
    ("Ticket Sharing", 1, 0),
]


def seed_quests(session: Session) -> None:
    """Sync the quest catalog: drop stale quests, add missing ones.

    Existing quests and levels keep their ids but their display fields are
    refreshed from the catalog. Live user progress is preserved.
    """
    wanted_names = {quest["name"] for quest in QUESTS}
    for stale in session.exec(select(Quest)).all():
        if stale.name not in wanted_names:
            session.exec(delete(QuestProgress).where(QuestProgress.quest_id == stale.id))
            session.exec(delete(QuestLevel).where(QuestLevel.quest_id == stale.id))
            session.delete(stale)
    session.commit()

    for index, quest in enumerate(QUESTS):
        row = session.exec(select(Quest).where(Quest.name == quest["name"])).first()
        if row is None:
            row = Quest(
                name=quest["name"],
                description=quest["description"],
                sort_order=index,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
        else:
            row.description = quest["description"]
            row.sort_order = index
            session.add(row)

        level_rows = {
            lvl.level_number: lvl
            for lvl in session.exec(select(QuestLevel).where(QuestLevel.quest_id == row.id)).all()
        }
        for level_number, target, goal, reward, xp, sticker in quest["levels"]:
            level = level_rows.get(level_number)
            if level is None:
                session.add(
                    QuestLevel(
                        quest_id=row.id,
                        level_number=level_number,
                        target_count=target,
                        goal_text=goal,
                        reward_name=reward,
                        reward_xp=xp,
                        reward_sticker=sticker,
                    )
                )
            else:
                level.target_count = target
                level.goal_text = goal
                level.reward_name = reward
                level.reward_xp = xp
                level.reward_sticker = sticker
                session.add(level)
    session.commit()


def seed_quest_progress(session: Session) -> None:
    """Add a demo progress row per quest for every account, if missing.

    Existing rows keep their live claimed/current values so a container
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
                        claimed_level=claimed,
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
            print("Database already seeded, quest chains backfilled...")
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
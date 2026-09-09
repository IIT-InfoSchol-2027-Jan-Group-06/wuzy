# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

import shutil
from pathlib import Path

import bcrypt
from sqlmodel import Session, select

from app.db.session import engine
from app.models.badge import Badge
from app.models.conversation import Conversation, ConversationMember
from app.models.follow import Follow
from app.models.group import Group, GroupMember
from app.models.post import Post
from app.models.task import Task
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

BADGES = [
    ("Raver", "/uploads/avatar/avatar1.png", True),
    ("Event Host", "/uploads/avatar/avatar2.png", False),
    ("Social Butterfly", "/uploads/avatar/avatar3.png", False),
    ("Ticket Master", "/uploads/avatar/avatar4.png", False),
]

TASKS = [
    ("Attend 3 Live Events", 3, 3, "completed", "CLAIMABLE", "CLAIM", "/uploads/avatar/avatar1.png"),
    ("Connect with 10 Ravers", 7, 10, "friends", "IN_PROGRESS", "ADD", "/uploads/avatar/avatar3.png"),
    ("Share an Event Ticket", 0, 1, "shared", "IN_PROGRESS", "SHARE", "/uploads/avatar/avatar4.png"),
]


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

        for name, image_url, is_unlocked in BADGES:
            session.add(Badge(name=name, image_url=image_url, is_unlocked=is_unlocked))

        for title, current, target, unit, status, action, badge_url in TASKS:
            session.add(
                Task(
                    title=title,
                    current_progress=current,
                    target_progress=target,
                    progress_unit=unit,
                    status=status,
                    action_type=action,
                    badge_image_url=badge_url,
                )
            )

        session.commit()

        post_count = session.exec(select(Post)).all().__len__()
        conversation_count = session.exec(select(Conversation)).all().__len__()
        group_count = session.exec(select(Group)).all().__len__()
        badge_count = session.exec(select(Badge)).all().__len__()
        task_count = session.exec(select(Task)).all().__len__()
        print("Demo data seeded successfully!")
        print(f"Created users: {', '.join(users)}")
        print(f"Created posts: {post_count}, conversations: {conversation_count}, groups: {group_count}")
        print(f"Created badges: {badge_count}, tasks: {task_count}")
        print("Demo logins (password123): abhiruk, ravindu644, sethuki, azma, charuki @test.com")
        print("Backend URL base: http://localhost:8000")


if __name__ == "__main__":
    seed()

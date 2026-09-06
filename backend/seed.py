# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

import shutil
from pathlib import Path

import bcrypt
from sqlmodel import Session, select

from app.db.session import engine
from app.models.conversation import Conversation, ConversationMember
from app.models.follow import Follow
from app.models.message import Message
from app.models.post import Post
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

# Conversations: (first username, second username, [(sender, text), ...], last message read)
CHATS = [
    (
        "abhiruk",
        "ravindu644",
        [
            ("ravindu644", "You free this weekend?"),
            ("abhiruk", "Saturday works, where we at?"),
            ("ravindu644", "Tennis at 7, courts at Gregory Park"),
            ("abhiruk", "Count me in"),
        ],
    ),
    (
        "abhiruk",
        "charuki",
        [
            ("charuki", "Did you see the lineup for the festival?"),
            ("abhiruk", "Headliners are insane this year"),
            ("charuki", "I already got my ticket, no excuses now 😄"),
        ],
    ),
    (
        "ravindu644",
        "sethuki",
        [
            ("sethuki", "Are you coming to the gallery opening?"),
            ("ravindu644", "Wouldn't miss it, is it the one on Marine Drive?"),
            ("sethuki", "Yeah, prints and wine, my two loves"),
            ("ravindu644", "Haha I'm there"),
        ],
    ),
    (
        "sethuki",
        "charuki",
        [
            ("charuki", "Can we shoot your new sketches for the poster tonight?"),
            ("sethuki", "Studio is free after 7"),
            ("charuki", "Perfect, bringing the camera"),
            ("sethuki", "Bring snacks too, we work hard"),
        ],
    ),
    (
        "azma",
        "sethuki",
        [
            ("azma", "That food market you posted yesterday looked unreal"),
            ("sethuki", "Kay, the kottu stand is a must"),
            ("azma", "I am going this weekend, want to join?"),
            ("sethuki", "Say no more"),
        ],
    ),
    (
        "azma",
        "charuki",
        [
            ("charuki", "New remix is out, tell me what you think"),
            ("azma", "Playing it right now, that drop is fire"),
            ("charuki", "You're the best first listener I have"),
        ],
    ),
    (
        "ravindu644",
        "azma",
        [
            ("azma", "Sunrise shoot at the coast on Sunday"),
            ("ravindu644", "I can do a 5K there after, perfect morning"),
            ("azma", "Deal, bring sunscreen 😂"),
        ],
    ),
    (
        "abhiruk",
        "azma",
        [
            ("azma", "Found the best street food spot in Pettah"),
            ("abhiruk", "You have to send me the name right now"),
            ("azma", "Chill bro, I'll take you there instead"),
        ],
    ),
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

        for first, second, messages in CHATS:
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
            for index, (sender, text) in enumerate(messages):
                # Everything but the newest last message is read, so every chat shows an unread dot
                session.add(
                    Message(
                        conversation_id=conversation.id,
                        sender_id=users[sender].id,
                        text=text,
                        is_read=index < len(messages) - 1,
                    )
                )

        session.commit()

        post_count = session.exec(select(Post)).all().__len__()
        message_count = session.exec(select(Message)).all().__len__()
        print("Demo data seeded successfully!")
        print(f"Created users: {', '.join(users)}")
        print(f"Created posts: {post_count}, messages: {message_count}")
        print("Demo logins (password123): abhiruk, ravindu644, sethuki, azma, charuki @test.com")
        print("Backend URL base: http://localhost:8000")


if __name__ == "__main__":
    seed()

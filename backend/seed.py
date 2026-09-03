# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

import shutil
from pathlib import Path

import bcrypt
from sqlmodel import Session, select

from app.db.session import engine
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


def seed():
    seed_media()
    with Session(engine) as session:
        if session.exec(select(User)).first():
            print("Database already seeded, skipping...")
            return

        users = [
            User(
                email="lana@example.com",
                username="lana_rae",
                hashed_password=hash_password("password123"),
                avatar_url="/uploads/avatar/avatar1.png",
                is_active=True,
            ),
            User(
                email="runclub@example.com",
                username="ny_run_club",
                hashed_password=hash_password("password123"),
                avatar_url="/uploads/avatar/avatar2.png",
                is_active=True,
            ),
            User(
                email="yash@example.com",
                username="yash_silva",
                hashed_password=hash_password("password123"),
                avatar_url="/uploads/avatar/avatar3.png",
                is_active=True,
            ),
            User(
                email="raya@example.com",
                username="raya_sing",
                hashed_password=hash_password("password123"),
                avatar_url="/uploads/avatar/avatar4.png",
                is_active=True,
            ),
        ]

        for user in users:
            session.add(user)
        session.commit()
        for user in users:
            session.refresh(user)

        # Post data: (author, media, caption, location, save_to_profile)
        posts = [
            (users[0], "post1.png", "Golden hour in the city", "new york", True),
            (users[1], "post2.png", "Morning run squad", "new jersey", True),
            (users[2], "post3.png", "New setup, who dis", "sri lanka", True),
            (users[3], "post4.png", "Street food tonight", "mumbai", True),
            (users[0], "post1.png", "Ephemeral city shot", "new york", False),
            (users[1], "post2.png", "Leg day done right", "new jersey", False),
            (users[2], "post3.png", "Late night coding", "sri lanka", False),
            (users[3], "post4.png", "Warm leftovers", "mumbai", False),
        ]

        for author, media, caption, location, save_to_profile in posts:
            session.add(
                Post(
                    media_url=f"/uploads/post/{media}",
                    caption=caption,
                    location=location,
                    save_to_profile=save_to_profile,
                    user_id=author.id,
                )
            )

        session.commit()
        print("Demo data seeded successfully!")
        print(f"Created users: {', '.join(u.username for u in users)}")
        print(f"Created posts: {len(posts)}")
        print("Backend URL base: http://localhost:8000")


if __name__ == "__main__":
    seed()

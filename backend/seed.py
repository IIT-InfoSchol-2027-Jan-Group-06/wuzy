# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

import bcrypt
from sqlmodel import Session, select

from app.db.session import engine
from app.models.post import Post
from app.models.user import User


def hash_password(password: str) -> str:
    # bcrypt directly (passlib 1.7.4 is deprecated and broken with bcrypt 5.x)
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed():
    with Session(engine) as session:
        if session.exec(select(User)).first():
            print("Database already seeded, skipping...")
            return

        user1 = User(
            email="alice@example.com",
            username="alice",
            hashed_password=hash_password("password123"),
            is_active=True,
        )
        user2 = User(
            email="bob@example.com",
            username="bob",
            hashed_password=hash_password("password123"),
            is_active=True,
        )

        session.add(user1)
        session.add(user2)
        session.commit()
        session.refresh(user1)
        session.refresh(user2)

        # Alice: one permanent post, one ephemeral
        session.add(
            Post(
                media_url="https://example.com/alice-permanent.jpg",
                caption="Alice's permanent profile post",
                save_to_profile=True,
                user_id=user1.id,
            )
        )
        session.add(
            Post(
                media_url="https://example.com/alice-ephemeral.jpg",
                caption="Alice's ephemeral story",
                save_to_profile=False,
                user_id=user1.id,
            )
        )

        # Bob: one permanent post
        session.add(
            Post(
                media_url="https://example.com/bob-permanent.jpg",
                caption="Bob's permanent profile post",
                save_to_profile=True,
                user_id=user2.id,
            )
        )

        session.commit()
        print("Demo data seeded successfully!")
        print(f"Created users: {user1.username}, {user2.username}")


if __name__ == "__main__":
    seed()

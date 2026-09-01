# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

from app.db.session import engine
from app.models.user import User
from app.models.post import Post
from sqlmodel import Session, select
import bcrypt


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

        session.add(Post(content="Hello Wuzy! This is my first post.", user_id=user1.id))
        session.add(Post(content="Loving the new social app!", user_id=user1.id))
        session.add(Post(content="Just joined, seems cool.", user_id=user2.id))
        session.commit()

        print("Demo data seeded successfully!")
        print(f"Created users: {user1.username}, {user2.username}")


if __name__ == "__main__":
    seed()

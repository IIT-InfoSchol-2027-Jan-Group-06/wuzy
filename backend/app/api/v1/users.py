"""User endpoints.

POST /users/                 - Register a new account
GET  /users/                 - List all users (used for explore / search)
GET  /users/by-username/{username} - Resolve a Wuzy profile QR to a user
POST /users/{id}/connect     - Turn a scanned QR into a Connection (mutual follow)
GET  /users/{id}             - Fetch a single user's profile
"""

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.follow import Follow
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    """Register a new user. The plaintext password is hashed with bcrypt before
    storage so raw credentials never touch the database.
    """
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=bcrypt.hashpw(
            payload.hashed_password.encode(), bcrypt.gensalt()
        ).decode(),
        avatar_url=payload.avatar_url,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/", response_model=list[UserRead])
def read_users(session: Session = Depends(get_session)):
    """List every user. Kept simple for now; a real search endpoint would
    filter by username or display_name.
    """
    return session.exec(select(User)).all()


@router.get("/by-username/{username}", response_model=UserRead)
def read_user_by_username(username: str, session: Session = Depends(get_session)):
    """Fetch a single user by username, used when a scanned Wuzy QR resolves."""
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/connect", response_model=UserRead)
def connect_user(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Connect with another user, making them a Connection (mutual follow).

    Idempotent: connecting twice is a no-op, so rescanning a code never inflates
    the connection count.
    """
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")
    other = session.get(User, user_id)
    if not other:
        raise HTTPException(status_code=404, detail="User not found")

    follows = {
        f.followed_id
        for f in session.exec(
            select(Follow).where(Follow.follower_id == current_user_id)
        ).all()
    }
    followed_back = {
        f.follower_id
        for f in session.exec(
            select(Follow).where(Follow.followed_id == current_user_id)
        ).all()
    }
    if user_id not in follows:
        session.add(Follow(follower_id=current_user_id, followed_id=user_id))
    if user_id not in followed_back:
        session.add(Follow(follower_id=user_id, followed_id=current_user_id))
    session.commit()
    session.refresh(other)
    return other


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, session: Session = Depends(get_session)):
    """Fetch a single user by ID. Used to populate the profile page."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

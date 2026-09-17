"""User endpoints.

POST /users/                 - Register a new account
GET  /users/                 - List all users (used for explore / search)
GET  /users/by-username/{username} - Resolve a Wuzy profile QR to a user
GET  /users/availability     - Signup pre-check: is this email / username free?
POST /users/{id}/connect     - Turn a scanned QR into a Connection (mutual follow)
GET  /users/{id}/connections - List a user's Connections (mutual follows)
GET  /users/{id}             - Fetch a single user's profile
PATCH /users/me              - Edit the caller's profile
"""

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, col, select

from app.api.v1.quests import record
from app.api.v1.ws import notify
from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.follow import Follow
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter()

@router.post("/", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    """Register a new user. The plaintext password is hashed with bcrypt before
    storage so raw credentials never touch the database.
    """
    if session.exec(select(User).where(User.email == payload.email)).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if session.exec(select(User).where(User.username == payload.username)).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    user = User(
        **payload.model_dump(exclude={"hashed_password"}),
        hashed_password=bcrypt.hashpw(
            payload.hashed_password.encode(), bcrypt.gensalt()
        ).decode(),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/availability")
def check_availability(
    email: str | None = None,
    username: str | None = None,
    session: Session = Depends(get_session),
) -> dict[str, bool]:
    """True means free. The signup flow asks per page so a taken handle fails early."""
    return {
        "email": not email
        or session.exec(select(User).where(User.email == email)).first() is None,
        "username": not username
        or session.exec(select(User).where(User.username == username)).first() is None,
    }


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


@router.get("/{user_id}/connections", response_model=list[UserRead])
def read_user_connections(user_id: int, session: Session = Depends(get_session)):
    """A user's Connections (mutual follows). The refer screen fetches this so
    it can hide the referred user's existing connections from its list.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    following = {
        f.followed_id
        for f in session.exec(
            select(Follow).where(Follow.follower_id == user_id)
        ).all()
    }
    followed_back = {
        f.follower_id
        for f in session.exec(
            select(Follow).where(Follow.followed_id == user_id)
        ).all()
    }
    connection_ids = following & followed_back
    if not connection_ids:
        return []
    return session.exec(select(User).where(col(User.id).in_(connection_ids))).all()


@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Edit the caller's profile. A full profile completes the Complete Profile quest."""
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    if user.display_name and user.bio and user.avatar_url and user.hobbies:
        record(session, current_user_id, "complete_profile", set_to=1)
    session.add(user)
    session.commit()
    session.refresh(user)
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
    new = user_id not in follows or user_id not in followed_back
    if user_id not in follows:
        session.add(Follow(follower_id=current_user_id, followed_id=user_id))
    if user_id not in followed_back:
        session.add(Follow(follower_id=user_id, followed_id=current_user_id))
    if new:
        # A fresh mutual follow is a connection for both sides.
        record(session, current_user_id, "social_network")
        record(session, user_id, "social_network")
    session.commit()
    session.refresh(other)
    if new:
        # Only the scanned user hears about it; the scanner is looking at the result.
        me = session.get(User, current_user_id)
        notify(
            session,
            user_id,
            "connection",
            actor=me,
            entity_id=me.id,
            url=f"/profile/{me.id}",
            body=f"{me.display_name or me.username} connected with you",
        )
    return other


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, session: Session = Depends(get_session)):
    """Fetch a single user by ID. Used to populate the profile page."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

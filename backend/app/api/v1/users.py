"""User endpoints.

POST /users/                 - Register a new account
GET  /users/                 - List all users (used for explore / search)
GET  /users/by-username/{username} - Resolve a Wuzy profile QR to a user
POST /users/{id}/connect     - Turn a scanned QR into a Connection (mutual follow)
GET  /users/{id}/connections - List a user's Connections (mutual follows)
GET  /users/{id}             - Fetch a single user's profile
GET  /users/me/xp            - Fetch current user's XP, rank, and progress
"""

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.follow import Follow
from app.models.ticket import Award
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter()

RANKS = [
    {"label": "Bronze", "threshold": 0},
    {"label": "Silver", "threshold": 100},
    {"label": "Gold", "threshold": 250},
    {"label": "Diamond", "threshold": 500},
]


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


@router.get("/me/xp")
def get_user_xp(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return the current user's total XP, rank, and progress to the next rank."""
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_xp = session.exec(
        select(Award).where(Award.user_id == current_user_id)
    ).all()
    total_xp = sum(a.reward_xp for a in total_xp)

    # Update user total_xp if it differs
    if user.total_xp != total_xp:
        user.total_xp = total_xp
        session.add(user)
        session.commit()
        session.refresh(user)

    rank = RANKS[0]
    for r in RANKS:
        if total_xp >= r["threshold"]:
            rank = r

    current_threshold = rank["threshold"]
    next_rank = None
    for r in RANKS:
        if r["threshold"] > current_threshold:
            next_rank = r
            break

    xp_in_rank = total_xp - current_threshold
    xp_to_next = next_rank["threshold"] - current_threshold if next_rank else 0
    progress_pct = min(100, round((xp_in_rank / xp_to_next) * 100)) if xp_to_next > 0 else 100

    return {
        "total_xp": total_xp,
        "rank": rank["label"],
        "progress_pct": progress_pct,
        "next_rank": next_rank["label"] if next_rank else None,
        "xp_in_rank": xp_in_rank,
        "xp_to_next": xp_to_next,
    }

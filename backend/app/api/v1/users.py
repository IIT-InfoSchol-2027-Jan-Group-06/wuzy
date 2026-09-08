"""User endpoints.

POST /users/     - Register a new account
GET  /users/     - List all users (used for explore / search)
GET  /users/{id} - Fetch a single user's profile
"""

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
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


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, session: Session = Depends(get_session)):
    """Fetch a single user by ID. Used to populate the profile page."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

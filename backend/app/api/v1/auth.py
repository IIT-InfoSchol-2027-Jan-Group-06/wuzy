"""Authentication endpoints.

POST /auth/login - email + password check, returns a signed JWT + the user
GET  /auth/me    - who the current bearer token belongs to

The login flow: client sends email/password, server verifies the bcrypt hash,
issues a short-lived JWT, and returns both the token and the full user object
so the frontend can immediately render the profile without a second request.
"""

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import create_access_token, get_current_user_id
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserRead

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    """Verify email and password, then hand back a signed access token.

    The password is compared against the bcrypt hash stored in the database.
    A failed lookup (wrong email or wrong password) returns the same 401 to
    avoid leaking whether an email exists.
    """
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not bcrypt.checkpw(payload.password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=user,
    )


@router.get("/me", response_model=UserRead)
def read_me(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return the user for the current token, so the app can restore a session.

    Called on app startup: the frontend loads the stored JWT, hits this
    endpoint, and if it succeeds the user is immediately logged in without
    re-entering credentials.
    """
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

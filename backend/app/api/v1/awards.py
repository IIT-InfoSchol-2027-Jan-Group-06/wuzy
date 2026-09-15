"""Award endpoints: the XP ledger rows a user has earned.

GET /awards/               - the current user's awards
GET /awards/user/{user_id} - any user's awards (public, profile stickers)

Rows with a badge_id are the stickers a profile shows; rows without one are
intermediate tier claims that only carried XP.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.ticket import Award
from app.models.user import User
from app.schemas.ticket import AwardRead

router = APIRouter()


@router.get("/", response_model=list[AwardRead])
def list_awards(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    return session.exec(
        select(Award)
        .where(Award.user_id == current_user_id)
        .order_by(col(Award.awarded_at).desc())
    ).all()


@router.get("/user/{user_id}", response_model=list[AwardRead])
def list_user_awards(user_id: int, session: Session = Depends(get_session)):
    if session.get(User, user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    return session.exec(
        select(Award).where(Award.user_id == user_id).order_by(col(Award.awarded_at).desc())
    ).all()

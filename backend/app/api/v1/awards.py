"""Award endpoints.

POST /awards/complete-profile - Mark profile as complete and receive an award.
GET  /awards/                - List awards for the current user.
GET  /awards/user/{user_id}  - List awards for any user (public).
GET  /awards/deck            - The current user's personal badge deck.
GET  /awards/user/{user_id}/deck - Any user's badge deck (public).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user_id
from app.core.badges import badge_id_for, deck_for
from app.db.session import get_session
from app.models.ticket import Award
from app.models.user import User
from app.schemas.ticket import AwardRead

router = APIRouter()

PROFILE_AWARD_XP = 100


@router.post("/complete-profile", response_model=AwardRead)
def complete_profile(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Mark the user's profile as complete and grant an award.

    A user can only receive the profile completion award once.
    """
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = session.exec(
        select(Award).where(
            Award.user_id == current_user_id,
            Award.award_type == "profile_complete",
        )
    ).first()
    if existing is not None:
        raise HTTPException(status_code=400, detail="Profile completion award already claimed")

    award = Award(
        user_id=current_user_id,
        award_type="profile_complete",
        reward_xp=PROFILE_AWARD_XP,
        badge_id=badge_id_for(session, current_user_id, "profile_complete"),
    )
    session.add(award)
    user.total_xp += PROFILE_AWARD_XP
    session.add(user)
    session.commit()
    session.refresh(award)

    return AwardRead.model_validate(award)


@router.get("/", response_model=list[AwardRead])
def list_awards(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return all awards received by the current user."""
    awards = session.exec(
        select(Award).where(Award.user_id == current_user_id).order_by(Award.awarded_at.desc())
    ).all()
    return awards


@router.get("/user/{user_id}", response_model=list[AwardRead])
def list_user_awards(
    user_id: int,
    session: Session = Depends(get_session),
):
    """Return all awards for a specific user (public, no auth required)."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    awards = session.exec(
        select(Award).where(Award.user_id == user_id).order_by(Award.awarded_at.desc())
    ).all()
    return awards


@router.get("/deck", response_model=list[int])
def get_my_deck(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return the current user's personal badge deck, persisting it on first use."""
    return deck_for(session, current_user_id)


@router.get("/user/{user_id}/deck", response_model=list[int])
def get_user_deck(
    user_id: int,
    session: Session = Depends(get_session),
):
    """Return a specific user's badge deck (public, no auth required)."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return deck_for(session, user_id)

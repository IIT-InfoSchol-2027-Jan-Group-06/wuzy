"""Quest endpoints: three flat tasks with live progress counter and a claim step.

GET  /quests/                 - Dashboard: every task, its counter, claim state
POST /quests/{quest_id}/progress - Count one performed action (e.g. a shared ticket)
POST /quests/{quest_id}/claim - Claim a completed task's reward (idempotent)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.quest import Quest, QuestProgress
from app.schemas.quest import QuestRead, QuestsDashboard

router = APIRouter()


def _get_or_create_progress(quest_id: int, user_id: int, session: Session) -> QuestProgress:
    """Return the caller's progress row for a task, creating one if missing."""
    progress = session.exec(
        select(QuestProgress).where(
            QuestProgress.quest_id == quest_id,
            QuestProgress.user_id == user_id,
        )
    ).first()
    if progress is None:
        progress = QuestProgress(user_id=user_id, quest_id=quest_id)
        session.add(progress)
        session.commit()
        session.refresh(progress)
    return progress


def _to_read(quest: Quest, progress: QuestProgress) -> QuestRead:
    """Build the API response. Completion is read off the counter; claimed is
    the stored flag set when the user presses Claim on a completed task."""
    return QuestRead(
        id=quest.id,
        name=quest.name,
        description=quest.description,
        reward_name=quest.reward_name,
        reward_xp=quest.reward_xp,
        reward_sticker=quest.reward_sticker,
        target_count=quest.target_count,
        progress_unit=quest.progress_unit,
        current_progress=progress.current_progress,
        claimed=progress.claimed,
    )


@router.get("/", response_model=QuestsDashboard)
def get_quests(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every task with the caller's progress and claim state."""
    quests = session.exec(select(Quest).order_by(Quest.sort_order)).all()
    return QuestsDashboard(
        quests=[
            _to_read(quest, _get_or_create_progress(quest.id, current_user_id, session))
            for quest in quests
        ]
    )


@router.post("/{quest_id}/progress", response_model=QuestRead)
def bump_quest_progress(
    quest_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Count one performed action (e.g. a shared ticket) toward a task.

    The counter is capped at the target, so a finished task stays finished.
    Reaching the target only unlocks the Claim step; it does not claim.
    """
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    progress = _get_or_create_progress(quest_id, current_user_id, session)
    progress.current_progress = min(quest.target_count, progress.current_progress + 1)
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return _to_read(quest, progress)


@router.post("/{quest_id}/claim", response_model=QuestRead)
def claim_quest(
    quest_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Claim a completed task's reward. Idempotent once claimed."""
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    progress = _get_or_create_progress(quest_id, current_user_id, session)
    if progress.current_progress < quest.target_count:
        raise HTTPException(status_code=400, detail="Quest target not yet met")

    progress.claimed = True
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return _to_read(quest, progress)
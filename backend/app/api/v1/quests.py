"""Quest chain endpoints.

GET  /quests/                      - Dashboard: every quest with per-level status
POST /quests/{quest_id}/progress   - Count one more action toward a quest
POST /quests/levels/{level_id}/claim - Claim a completed level's reward
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.quest import Quest, QuestLevel, QuestProgress
from app.quest_logic import STATUS_COMPLETED, claimed_xp, compute_level_status
from app.schemas.quest import QuestClaimResponse, QuestLevelRead, QuestRead, QuestsDashboard

router = APIRouter()


def _get_or_create_progress(quest_id: int, user_id: int, session: Session) -> QuestProgress:
    """Return the user's progress row for a quest, creating one if missing."""
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
    """Build the API response for a quest, deriving each level's status."""
    levels = quest.levels
    read_levels: list[QuestLevelRead] = []
    prev_target: int | None = None
    for level in levels:
        read_levels.append(
            QuestLevelRead(
                id=level.id,
                level_number=level.level_number,
                target_count=level.target_count,
                goal_text=level.goal_text,
                reward_name=level.reward_name,
                reward_xp=level.reward_xp,
                reward_sticker=level.reward_sticker,
                status=compute_level_status(
                    progress.current_progress,
                    progress.claimed_level,
                    level.level_number,
                    prev_target,
                    level.target_count,
                ),
            )
        )
        prev_target = level.target_count
    return QuestRead(
        id=quest.id,
        name=quest.name,
        description=quest.description,
        current_progress=progress.current_progress,
        total_xp=claimed_xp(progress.claimed_level, levels),
        levels=read_levels,
    )


@router.get("/", response_model=QuestsDashboard)
def get_quests(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every quest with the caller's per-level status."""
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
    """Count one more action toward a quest, e.g. a shared ticket."""
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    progress = _get_or_create_progress(quest_id, current_user_id, session)
    progress.current_progress += 1
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return _to_read(quest, progress)


@router.post("/levels/{level_id}/claim", response_model=QuestClaimResponse)
def claim_level(
    level_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Claim a completed level's reward.

    Claims are sequential: only the next unclaimed level (claimed_level + 1)
    can be claimed, and only once its target is met.
    """
    level = session.get(QuestLevel, level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Quest level not found")

    quest = session.get(Quest, level.quest_id)
    progress = _get_or_create_progress(level.quest_id, current_user_id, session)

    if level.level_number != progress.claimed_level + 1:
        raise HTTPException(status_code=400, detail="Claim quest levels in order")
    if level.level_number <= progress.claimed_level:
        raise HTTPException(status_code=400, detail="Level already claimed")

    # The previous level's target determines whether this one is unlocked.
    prev_target: int | None = None
    for other in quest.levels:
        if other.id == level.id:
            break
        prev_target = other.target_count

    status = compute_level_status(
        progress.current_progress,
        progress.claimed_level,
        level.level_number,
        prev_target,
        level.target_count,
    )
    if status != STATUS_COMPLETED:
        raise HTTPException(status_code=400, detail="Level target not yet met")

    progress.claimed_level = level.level_number
    session.add(progress)
    session.commit()
    session.refresh(progress)

    return QuestClaimResponse(
        quest_id=quest.id,
        level_id=level.id,
        level_number=level.level_number,
        status="CLAIMED",
        reward_name=level.reward_name,
        reward_xp=level.reward_xp,
        reward_sticker=level.reward_sticker,
        total_xp=claimed_xp(progress.claimed_level, quest.levels),
    )
"""Quest endpoints: tasks made of ordered subtasks with a claim step.

GET  /quests/                         - Dashboard: every task, its active
                                        subtask and the subtask totals
POST /quests/{quest_id}/progress      - Increment a counted action (bump),
                                        capped at the active subtask's target
POST /quests/{quest_id}/claim         - Claim the active subtask once the
                                        counter has reached its target,
                                        advancing to the next one
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.quest import Quest, QuestSubtask, QuestSubtaskProgress
from app.schemas.quest import QuestRead, QuestsDashboard, QuestSubtaskRead

router = APIRouter()


def _subtasks_for(quest_id: int, session: Session) -> list[QuestSubtask]:
    """The task's subtasks in display order."""
    return list(
        session.exec(
            select(QuestSubtask)
            .where(QuestSubtask.quest_id == quest_id)
            .order_by(QuestSubtask.sort_order)
        ).all()
    )


def _get_or_create_subtask_progress(
    subtask_id: int, user_id: int, session: Session
) -> QuestSubtaskProgress:
    row = session.exec(
        select(QuestSubtaskProgress).where(
            QuestSubtaskProgress.subtask_id == subtask_id,
            QuestSubtaskProgress.user_id == user_id,
        )
    ).first()
    if row is None:
        row = QuestSubtaskProgress(user_id=user_id, subtask_id=subtask_id)
        session.add(row)
        session.commit()
        session.refresh(row)
    return row


def _active_step(
    quest: Quest, user_id: int, session: Session
) -> tuple[list[QuestSubtask], QuestSubtask | None, QuestSubtaskProgress | None, int]:
    """Return subtasks, the first unclaimed one, its progress row and index.

    Every subtask is guaranteed a progress row (created on demand), so the
    active subtask is simply the earliest unclaimed one. index is the
    0-based position of the active subtask inside the task.
    """
    subtasks = _subtasks_for(quest.id, session)
    for index, subtask in enumerate(subtasks):
        progress = _get_or_create_subtask_progress(subtask.id, user_id, session)
        if not progress.claimed:
            return subtasks, subtask, progress, index
    return subtasks, None, None, -1


def _claimed_steps(subtasks: list[QuestSubtask], user_id: int, session: Session) -> int:
    """How many subtasks the user has already claimed in this task."""
    count = 0
    for subtask in subtasks:
        row = session.exec(
            select(QuestSubtaskProgress).where(
                QuestSubtaskProgress.subtask_id == subtask.id,
                QuestSubtaskProgress.user_id == user_id,
            )
        ).first()
        if row is not None and row.claimed:
            count += 1
    return count


def _read(
    quest: Quest,
    subtasks: list[QuestSubtask],
    active: QuestSubtask | None,
    progress: QuestSubtaskProgress | None,
    step_index: int,
    claimed_steps: int,
) -> QuestRead:
    """Build the API response for a task."""
    active_subtask = None
    if active and progress:
        active_subtask = QuestSubtaskRead(
            id=active.id,
            name=active.name,
            description=active.description,
            target_count=active.target_count,
            progress_unit=active.progress_unit,
            reward_xp=active.reward_xp,
            reward_sticker=active.reward_sticker,
            current_progress=progress.current_progress,
            claimed=progress.claimed,
        )
    return QuestRead(
        id=quest.id,
        name=quest.name,
        description=quest.description,
        active_subtask=active_subtask,
        subtask_step=step_index + 1,
        subtask_total=len(subtasks),
        claimed_steps=claimed_steps,
    )


@router.get("/", response_model=QuestsDashboard)
def get_quests(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every task with the caller's active subtask and claim state."""
    quests = session.exec(select(Quest).order_by(Quest.sort_order)).all()
    dashboard = []
    for quest in quests:
        subtasks, active, progress, step_index = _active_step(quest, current_user_id, session)
        claimed_steps = _claimed_steps(subtasks, current_user_id, session)
        dashboard.append(_read(quest, subtasks, active, progress, step_index, claimed_steps))
    return QuestsDashboard(quests=dashboard)


@router.post("/{quest_id}/progress", response_model=QuestRead)
def bump_progress(
    quest_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Increment the active subtask's counter by one, capped at its target.

    Returns the refreshed task state. The response shows the same state
    when the counter is already at (or above) the target.
    """
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    subtasks, active, progress, step_index = _active_step(quest, current_user_id, session)
    if active is None or progress is None:
        raise HTTPException(status_code=400, detail="Quest already complete")

    if progress.current_progress < active.target_count:
        progress.current_progress += 1
        session.add(progress)
        session.commit()
        session.refresh(progress)

    claimed_steps = _claimed_steps(subtasks, current_user_id, session)
    return _read(quest, subtasks, active, progress, step_index, claimed_steps)


@router.post("/{quest_id}/claim", response_model=QuestRead)
def claim_level(
    quest_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Claim the active subtask once its counter has reached its target.

    On the final subtask this awards the task reward; the API response
    then has no active_subtask, which the client reads as the whole task
    done. Claiming before the counter hits the target returns 400.
    """
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    subtasks, active, progress, _ = _active_step(quest, current_user_id, session)
    if active is None or progress is None:
        raise HTTPException(status_code=400, detail="Quest already complete")

    if progress.current_progress < active.target_count:
        raise HTTPException(status_code=400, detail="Subtask target not reached")

    progress.claimed = True
    session.add(progress)
    session.commit()
    session.refresh(progress)

    # Recompute the next active subtask now that this one is claimed.
    _, next_active, next_progress, next_index = _active_step(quest, current_user_id, session)
    claimed_steps = _claimed_steps(subtasks, current_user_id, session)
    return _read(quest, subtasks, next_active, next_progress, next_index, claimed_steps)

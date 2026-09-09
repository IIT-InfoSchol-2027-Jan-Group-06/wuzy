"""Awards & Badges endpoints.

GET  /awards                    - Dashboard: all badges, all tasks, ready count
POST /tasks/{task_id}/progress  - Bump a task's progress by one (e.g. each share)
POST /tasks/{id}/claim          - Claim a completed task and unlock its badge
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.badge import Badge
from app.models.task import Task
from app.schemas.awards import AwardsDashboard, BadgeRead, TaskClaimResponse, TaskRead

router = APIRouter()


@router.get("/", response_model=AwardsDashboard)
def get_awards(session: Session = Depends(get_session)):
    """Return the full Awards & Badges dashboard.

    badges: every badge for the sticker board.
    tasks: every task with progress, status, and action info.
    ready_count: how many tasks are in CLAIMABLE status.
    """
    badges = session.exec(select(Badge)).all()
    tasks = session.exec(select(Task)).all()
    ready_count = sum(1 for t in tasks if t.status == "CLAIMABLE")
    return AwardsDashboard(
        badges=[BadgeRead.model_validate(b) for b in badges],
        tasks=[TaskRead.model_validate(t) for t in tasks],
        ready_count=ready_count,
    )


@router.post("/tasks/{task_id}/progress", response_model=TaskRead)
def bump_task_progress(
    task_id: int,
    session: Session = Depends(get_session),
):
    """Count one more completed action toward a task, e.g. a ticket share.

    Progress is capped at the target; once it reaches the target the task
    flips to CLAIMABLE so it can be claimed. Claimed tasks stay put.
    """
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status != "CLAIMED":
        task.current_progress = min(task.target_progress, task.current_progress + 1)
        if task.current_progress >= task.target_progress:
            task.status = "CLAIMABLE"
        session.add(task)
        session.commit()
        session.refresh(task)

    return TaskRead.model_validate(task)


@router.post("/tasks/{task_id}/claim", response_model=TaskClaimResponse)
def claim_task(
    task_id: int,
    session: Session = Depends(get_session),
):
    """Process a task claim.

    Validates that the task is CLAIMABLE (current_progress >= target_progress),
    updates its status to CLAIMED, and unlocks the corresponding badge.
    """
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status == "CLAIMED":
        raise HTTPException(status_code=400, detail="Task already claimed")

    if task.current_progress < task.target_progress:
        raise HTTPException(status_code=400, detail="Task progress not yet complete")

    task.status = "CLAIMED"
    session.add(task)

    # Unlock the badge that matches this task's badge image.
    badge = session.exec(
        select(Badge).where(Badge.image_url == task.badge_image_url)
    ).first()
    if badge:
        badge.is_unlocked = True
        session.add(badge)

    session.commit()
    session.refresh(task)

    return TaskClaimResponse(
        id=task.id,
        status=task.status,
        badge_unlocked=badge.is_unlocked if badge else False,
    )

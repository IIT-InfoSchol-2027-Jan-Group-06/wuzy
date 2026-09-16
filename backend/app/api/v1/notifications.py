"""The notifications page feed.

GET  /notifications       - the caller's rows, newest first
POST /notifications/read  - mark every unread row as read

Rows are written by ws.notify() from wherever an action happens.
"""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query, Response
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.notification import Notification
from app.schemas.notification import NotificationRead

router = APIRouter()


@router.get("", response_model=list[NotificationRead])
def list_notifications(
    limit: int = Query(default=50, ge=1, le=200),
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    return session.exec(
        select(Notification)
        .where(Notification.user_id == current_user_id)
        .order_by(col(Notification.created_at).desc(), col(Notification.id).desc())
        .limit(limit)
    ).all()


@router.post("/read", status_code=204)
def mark_all_read(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    rows = session.exec(
        select(Notification).where(
            Notification.user_id == current_user_id,
            col(Notification.read_at).is_(None),
        )
    ).all()
    now = datetime.now(UTC)
    for row in rows:
        row.read_at = now
        session.add(row)
    session.commit()
    return Response(status_code=204)

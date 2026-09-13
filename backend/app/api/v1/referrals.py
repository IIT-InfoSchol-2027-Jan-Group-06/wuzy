"""Referral requests: introducing a connection to another connection.

POST /referrals           - the sender creates one pending request
GET  /referrals/outgoing  - every request the current user sent (refer-screen lock)
GET  /referrals/inbox     - every request sent to the current user (notifications)

Creating a request delivers it to the referred user twice: a live frame over
their shared WebSocket (or their offline mailbox if they are away) and a
best-effort OS push banner via Expo. Both the live entry and the notifications
tab entry back the same row, so a response to either resolves both.
"""

import threading

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.api.v1.ws import deliver_live
from app.core.auth import get_current_user_id
from app.core.push import send_push
from app.db.session import engine, get_session
from app.models.push_token import PushToken
from app.models.referral import ReferralRequest
from app.models.user import User
from app.schemas.referral import ReferralCreate, ReferralRead, ReferralRespond

router = APIRouter()


def _display_name(user: User) -> str:
    return user.display_name or user.username


def _read(session: Session, request: ReferralRequest) -> ReferralRead:
    """Build the response schema with the sender and target names resolved."""
    sender = session.get(User, request.sender_id)
    target = session.get(User, request.target_id)
    return ReferralRead(
        id=request.id,
        sender_id=request.sender_id,
        referred_id=request.referred_id,
        target_id=request.target_id,
        status=request.status,
        consumed=request.consumed,
        created_at=request.created_at,
        sender_name=_display_name(sender) if sender else None,
        target_name=_display_name(target) if target else None,
        sender_avatar_url=sender.avatar_url if sender else None,
    )


def _notify_referral(request: ReferralRequest) -> None:
    """Deliver a new referral to the referred user: live frame plus OS push.

    The Expo push call can take seconds, so it runs on a daemon thread like
    chat pushes. The live frame goes out on the request path.
    """
    with Session(engine) as session:
        sender = session.get(User, request.sender_id)
        target = session.get(User, request.target_id)
        sender_name = _display_name(sender) if sender else None
        target_name = _display_name(target) if target else None
    payload = {
        "type": "referral",
        "request_id": request.id,
        "sender_id": request.sender_id,
        "referred_id": request.referred_id,
        "target_id": request.target_id,
        "sender_name": sender_name,
        "target_name": target_name,
        "status": request.status,
        "created_at": request.created_at.isoformat(),
    }
    deliver_live(request.referred_id, payload)

    with Session(engine) as session:
        token = session.exec(
            select(PushToken).where(PushToken.user_id == request.referred_id)
        ).first()
    if token is None:
        return
    title = sender_name or "Someone"
    body = f"wants to refer you to {target_name}"
    threading.Thread(
        target=send_push,
        args=(token.token, title, body),
        kwargs={"data": {"url": "/notifications"}},
        daemon=True,
    ).start()


@router.post("", response_model=ReferralRead)
def create_referral(
    payload: ReferralCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Create a pending referral from the caller to the referred user.

    Idempotent only while a pending request exists for the same triple:
    re-sending before a response just returns that pending request. Once the
    most recent request is accepted or declined, a new tap creates a fresh
    pending row so the same target can be referred again later.
    """
    for other_id in (payload.referred_id, payload.target_id):
        if other_id == current_user_id:
            raise HTTPException(status_code=400, detail="Cannot refer yourself")
    existing = session.exec(
        select(ReferralRequest).where(
            ReferralRequest.sender_id == current_user_id,
            ReferralRequest.referred_id == payload.referred_id,
            ReferralRequest.target_id == payload.target_id,
            ReferralRequest.status == "pending",
        )
    ).first()
    if existing is not None:
        session.commit()
        return _read(session, existing)
    request = ReferralRequest(
        sender_id=current_user_id,
        referred_id=payload.referred_id,
        target_id=payload.target_id,
    )
    session.add(request)
    try:
        session.commit()
    except IntegrityError:
        # A concurrent sender beat us to this pending combo; return their row.
        session.rollback()
        existing = session.exec(
            select(ReferralRequest).where(
                ReferralRequest.sender_id == current_user_id,
                ReferralRequest.referred_id == payload.referred_id,
                ReferralRequest.target_id == payload.target_id,
                ReferralRequest.status == "pending",
            )
        ).first()
        if existing is not None:
            return _read(session, existing)
        raise
    session.refresh(request)
    _notify_referral(request)
    return _read(session, request)


@router.get("/outgoing", response_model=list[ReferralRead])
def list_outgoing(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Every referral the caller sent, newest first. The refer screen uses this
    to keep showing the pending note on an already-requested target."""
    requests = session.exec(
        select(ReferralRequest)
        .where(ReferralRequest.sender_id == current_user_id)
        .order_by(ReferralRequest.created_at.desc())
    ).all()
    return [_read(session, request) for request in requests]


@router.get("/inbox", response_model=list[ReferralRead])
def list_inbox(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Every referral sent to the caller, newest first. The notifications tab
    lists these as live entries."""
    requests = session.exec(
        select(ReferralRequest)
        .where(ReferralRequest.referred_id == current_user_id)
        .order_by(ReferralRequest.created_at.desc())
    ).all()
    return [_read(session, request) for request in requests]


def _notify_responded(request: ReferralRequest) -> None:
    """Tell the sender their referral was answered, live over the shared socket."""
    with Session(engine) as session:
        referred = session.get(User, request.referred_id)
        target = session.get(User, request.target_id)
    payload = {
        "type": "referral_response",
        "request_id": request.id,
        "sender_id": request.sender_id,
        "referred_id": request.referred_id,
        "target_id": request.target_id,
        "referred_name": _display_name(referred) if referred else None,
        "target_name": _display_name(target) if target else None,
        "status": request.status,
    }
    deliver_live(request.sender_id, payload)


@router.post("/{request_id}/respond", response_model=ReferralRead)
def respond_referral(
    request_id: int,
    payload: ReferralRespond,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Resolve a referral. Only the referred user may respond, and only once.

    The caller is notified live so their refer screen can reflect the outcome;
    a connection between the parties or other deeper effects stay deferred.
    """
    request = session.get(ReferralRequest, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    if request.referred_id != current_user_id:
        raise HTTPException(status_code=403, detail="Only the referred user can respond")
    if request.status == "pending":
        request.status = "accepted" if payload.accept else "declined"
        session.add(request)
        session.commit()
        session.refresh(request)
        _notify_responded(request)
    return _read(session, request)


@router.post("/{request_id}/consume", response_model=ReferralRead)
def consume_referral(
    request_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Mark a resolved referral as seen by its sender, once.

    The sender's card stops showing the accepted/declined outcome and returns
    to the Send Request pill after this, so re-expanding it (or re-fetching)
    never brings the old text back. Idempotent.
    """
    request = session.get(ReferralRequest, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    if request.sender_id != current_user_id:
        raise HTTPException(status_code=403, detail="Only the sender can consume")
    if not request.consumed:
        request.consumed = True
        session.add(request)
        session.commit()
        session.refresh(request)
    return _read(session, request)

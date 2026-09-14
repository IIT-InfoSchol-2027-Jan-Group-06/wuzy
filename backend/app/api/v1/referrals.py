"""Referral requests: introducing two connections to each other.

POST /referrals           - the sender creates a request between two users
GET  /referrals/outgoing  - every request the current user sent (refer-screen lock)
GET  /referrals/inbox     - every request naming the current user (notifications)

Creating a request delivers it to both recipients over their shared WebSocket
(or their offline mailbox) plus a best-effort OS push banner via Expo, each
saying the sender wants to refer them to the other. A referral only becomes a
connection (mutual follow) when both recipients accept; either decline voids
it for everyone.
"""

import threading

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.api.v1.ws import deliver_live
from app.core.auth import get_current_user_id
from app.core.push import send_push
from app.db.session import engine, get_session
from app.models.follow import Follow
from app.models.push_token import PushToken
from app.models.referral import ReferralRequest
from app.models.user import User
from app.schemas.referral import ReferralCreate, ReferralRead, ReferralRespond

router = APIRouter()

PENDING = "pending"
ACCEPTED = "accepted"
DECLINED = "declined"


def _display_name(user: User) -> str:
    return user.display_name or user.username


def _pair_ids(a: int, b: int) -> tuple[int, int]:
    """Recipient ids sorted so a sender-pair is unique regardless of pick order."""
    return (a, b) if a < b else (b, a)


def _overall_status(first: str, second: str) -> str:
    """Derive the whole-referral status from the two recipients' replies."""
    if first == DECLINED or second == DECLINED:
        return DECLINED
    if first == ACCEPTED and second == ACCEPTED:
        return ACCEPTED
    return PENDING


def _read(session: Session, request: ReferralRequest) -> ReferralRead:
    """Build the response schema with the sender and both recipients resolved."""
    sender = session.get(User, request.sender_id)
    first = session.get(User, request.first_user_id)
    second = session.get(User, request.second_user_id)
    return ReferralRead(
        id=request.id,
        sender_id=request.sender_id,
        first_user_id=request.first_user_id,
        second_user_id=request.second_user_id,
        status=request.status,
        first_status=request.first_status,
        second_status=request.second_status,
        consumed=request.consumed,
        created_at=request.created_at,
        sender_name=_display_name(sender) if sender else None,
        first_name=_display_name(first) if first else None,
        second_name=_display_name(second) if second else None,
        sender_avatar_url=sender.avatar_url if sender else None,
    )


def _frame(request: ReferralRequest) -> dict:
    """The live referral frame both clients use to refresh their lists."""
    with Session(engine) as session:
        sender = session.get(User, request.sender_id)
        first = session.get(User, request.first_user_id)
        second = session.get(User, request.second_user_id)
        sender_name = _display_name(sender) if sender else None
        first_name = _display_name(first) if first else None
        second_name = _display_name(second) if second else None
    return {
        "type": "referral",
        "request_id": request.id,
        "sender_id": request.sender_id,
        "first_user_id": request.first_user_id,
        "second_user_id": request.second_user_id,
        "sender_name": sender_name,
        "first_name": first_name,
        "second_name": second_name,
        "status": request.status,
        "created_at": request.created_at.isoformat(),
    }


def _notify_referral(request: ReferralRequest) -> None:
    """Deliver a new referral to both recipients: live frame plus OS push.

    Each recipient sees themselves referred to the other, so the push pairs the
    sender's name with the other recipient's name per recipient. The Expo push
    calls can take seconds, so they run on daemon threads like chat pushes.
    """
    payload = _frame(request)
    deliver_live(request.first_user_id, payload)
    deliver_live(request.second_user_id, payload)

    with Session(engine) as session:
        tokens = session.exec(
            select(PushToken).where(
                PushToken.user_id.in_([request.first_user_id, request.second_user_id])
            )
        ).all()
    if not tokens:
        return
    sender_name = payload["sender_name"]
    for token in tokens:
        other_name = (
            payload["second_name"]
            if token.user_id == request.first_user_id
            else payload["first_name"]
        )
        title = sender_name or "Someone"
        body = f"wants to refer you to {other_name}"
        threading.Thread(
            target=send_push,
            args=(token.token, title, body),
            kwargs={"data": {"url": "/notifications"}},
            daemon=True,
        ).start()


def _notify_resolved(request: ReferralRequest) -> None:
    """Tell both recipients a referral popped (connection or denial)."""
    payload = _frame(request)
    deliver_live(request.first_user_id, payload)
    deliver_live(request.second_user_id, payload)


def _connect_pair(a_id: int, b_id: int) -> None:
    """Make the two recipients Connections (mutual follow). Idempotent.

    Runs once both have accepted. The refer screen already avoids pairs that
    are connected, but the edges are still guarded so an accepted referral
    never duplicates a follow.
    """
    with Session(engine) as session:
        follows = {
            f.followed_id
            for f in session.exec(select(Follow).where(Follow.follower_id == a_id)).all()
        }
        followed_back = {
            f.follower_id
            for f in session.exec(select(Follow).where(Follow.followed_id == a_id)).all()
        }
        if b_id not in follows:
            session.add(Follow(follower_id=a_id, followed_id=b_id))
        if b_id not in followed_back:
            session.add(Follow(follower_id=b_id, followed_id=a_id))
        session.commit()


@router.post("", response_model=ReferralRead)
def create_referral(
    payload: ReferralCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Create a pending referral between two of the sender's connections.

    Idempotent only while a pending request exists for the same sender-pair:
    re-sending before a response just returns that request. Once the most
    recent request is resolved, a new tap creates a fresh pending row so the
    same pair can be referred again later.
    """
    if payload.first_user_id == current_user_id or payload.second_user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")
    first_user_id, second_user_id = _pair_ids(
        payload.first_user_id, payload.second_user_id
    )
    existing = session.exec(
        select(ReferralRequest).where(
            ReferralRequest.sender_id == current_user_id,
            ReferralRequest.first_user_id == first_user_id,
            ReferralRequest.second_user_id == second_user_id,
            ReferralRequest.status == PENDING,
        )
    ).first()
    if existing is not None:
        session.commit()
        return _read(session, existing)
    request = ReferralRequest(
        sender_id=current_user_id,
        first_user_id=first_user_id,
        second_user_id=second_user_id,
    )
    session.add(request)
    try:
        session.commit()
    except IntegrityError:
        # A concurrent sender beat us to this pending pair; return their row.
        session.rollback()
        existing = session.exec(
            select(ReferralRequest).where(
                ReferralRequest.sender_id == current_user_id,
                ReferralRequest.first_user_id == first_user_id,
                ReferralRequest.second_user_id == second_user_id,
                ReferralRequest.status == PENDING,
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
    to keep the pending and outcome notes attached to an already-requested pair."""
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
    """Every referral naming the caller as a recipient, newest first.

    Resolved referrals stay in the list: the notifications screen pops each
    outcome once per session (Connection made / Referral Denied), so it needs
    the terminal state even when the referral resolved while the user was away.
    """
    requests = session.exec(
        select(ReferralRequest)
        .where(
            (ReferralRequest.first_user_id == current_user_id)
            | (ReferralRequest.second_user_id == current_user_id)
        )
        .order_by(ReferralRequest.created_at.desc())
    ).all()
    return [_read(session, request) for request in requests]


def _notify_sender(request: ReferralRequest) -> None:
    """Tell the sender their referral moved, live over the shared socket."""
    with Session(engine) as session:
        first = session.get(User, request.first_user_id)
        second = session.get(User, request.second_user_id)
    payload = {
        "type": "referral_response",
        "request_id": request.id,
        "sender_id": request.sender_id,
        "first_user_id": request.first_user_id,
        "second_user_id": request.second_user_id,
        "first_name": _display_name(first) if first else None,
        "second_name": _display_name(second) if second else None,
        "first_status": request.first_status,
        "second_status": request.second_status,
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
    """Record one recipient's reply to a referral. Each recipient responds once.

    The reply updates only the responder's own status. A decline voids the
    whole referral; the second accept resolves it into a real connection
    (mutual follow) between the two. The sender is notified live on every
    response so their refer screen updates in place, and both recipients are
    notified when the referral fully resolves so their notifications pop the
    result.
    """
    request = session.get(ReferralRequest, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    if current_user_id not in (request.first_user_id, request.second_user_id):
        raise HTTPException(status_code=403, detail="Only a recipient can respond")
    if current_user_id == request.first_user_id:
        if request.first_status != PENDING:
            return _read(session, request)
        request.first_status = ACCEPTED if payload.accept else DECLINED
    else:
        if request.second_status != PENDING:
            return _read(session, request)
        request.second_status = ACCEPTED if payload.accept else DECLINED
    request.status = _overall_status(request.first_status, request.second_status)
    session.add(request)
    session.commit()
    session.refresh(request)
    if request.status == ACCEPTED:
        _connect_pair(request.first_user_id, request.second_user_id)
    _notify_sender(request)
    if request.status != PENDING:
        _notify_resolved(request)
    return _read(session, request)


@router.post("/{request_id}/consume", response_model=ReferralRead)
def consume_referral(
    request_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Mark a resolved referral as seen by its sender, once.

    The sender's card stops showing the outcome and returns to the Send Request
    pill after this, so re-expanding it (or re-fetching) never brings the old
    text back. Idempotent.
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

"""Referral requests: introducing two connections to each other.

POST /referrals           - the sender creates a request between two users
GET  /referrals/outgoing  - every request the current user sent (refer-screen lock)

Every step lands on the notifications page through ws.notify(): both
recipients get a `referral` row (with Accept/Decline) when the request is
created, the sender gets a `referral_response` row on each reply, and both
recipients get a `connection` or `referral_declined` row when it resolves. A
referral only becomes a connection (mutual follow) when both recipients
accept; either decline voids it for everyone.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.api.v1.ws import notify
from app.core.auth import get_current_user_id
from app.db.session import engine, get_session
from app.models.follow import Follow
from app.models.notification import Notification
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


def _recipients(session: Session, request: ReferralRequest) -> list[tuple[User, User]]:
    """(me, other) for each recipient, so each sees the referral from their side."""
    first = session.get(User, request.first_user_id)
    second = session.get(User, request.second_user_id)
    return [(first, second), (second, first)]


def _notify_referral(session: Session, request: ReferralRequest) -> None:
    """Give both recipients a referral row; away devices get a push with Accept/Decline."""
    sender = session.get(User, request.sender_id)
    for me, other in _recipients(session, request):
        notify(
            session,
            me.id,
            "referral",
            actor=sender,
            entity_id=request.id,
            body=f"{_display_name(sender)} wants to refer you to {_display_name(other)}",
            payload={"other_name": _display_name(other), "my_status": PENDING, "status": PENDING},
            channel="referrals",
            category="referrals",
        )


def _notify_response(session: Session, request: ReferralRequest, responder: User) -> None:
    """Tell the sender about a reply, keep the recipients' referral rows current,
    and hand both recipients the outcome once the referral resolves."""
    sender = session.get(User, request.sender_id)
    pairs = _recipients(session, request)
    my_status = (
        request.first_status if responder.id == request.first_user_id else request.second_status
    )
    other = next(o for me, o in pairs if me.id == responder.id)
    notify(
        session,
        request.sender_id,
        "referral_response",
        actor=responder,
        entity_id=request.id,
        body=f"{_display_name(responder)} {my_status} your referral to {_display_name(other)}",
        payload={
            "status": request.status,
            "first_status": request.first_status,
            "second_status": request.second_status,
        },
    )

    rows = session.exec(
        select(Notification).where(
            Notification.type == "referral", Notification.entity_id == request.id
        )
    ).all()
    for row in rows:
        update = {"status": request.status}
        if row.user_id == responder.id:
            update["my_status"] = my_status
        # Reassign so SQLAlchemy notices the JSON column changed.
        row.payload = {**row.payload, **update}
        session.add(row)
    session.commit()

    if request.status == ACCEPTED:
        for me, other in pairs:
            notify(
                session,
                me.id,
                "connection",
                actor=other,
                entity_id=other.id,
                url=f"/profile/{other.id}",
                body=(
                    f"You are now connected with {_display_name(other)} "
                    f"via {_display_name(sender)}'s referral"
                ),
            )
    elif request.status == DECLINED:
        for me, other in pairs:
            notify(
                session,
                me.id,
                "referral_declined",
                actor=sender,
                entity_id=request.id,
                body=f"Your referral with {_display_name(other)} was declined",
            )


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
        a_added = False
        b_added = False
        if b_id not in follows:
            session.add(Follow(follower_id=a_id, followed_id=b_id))
            a_added = True
        if b_id not in followed_back:
            session.add(Follow(follower_id=b_id, followed_id=a_id))
            b_added = True
        if a_added or b_added:
            from app.api.v1.quests import bump_quest_for
            if a_added:
                bump_quest_for(a_id, "Social Network", session)
            if b_added:
                bump_quest_for(b_id, "Social Network", session)
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
    _notify_referral(session, request)
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
    (mutual follow) between the two. The sender is notified on every response
    so their refer screen updates in place, and both recipients are notified
    when the referral fully resolves.
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
    _notify_response(session, request, session.get(User, current_user_id))
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

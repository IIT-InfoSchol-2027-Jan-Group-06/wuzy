"""Ticket endpoints.

POST /tickets/purchase   - buy one or more tickets, optionally for an event
POST /tickets/{id}/share - count a share of your own ticket (after the share sheet)
POST /tickets/gift       - buy a ticket for a connection; they get it and a notification
GET  /tickets/           - your tickets, newest first, with the event slice for the card

Each action counts toward its quest server-side (ticket_holder, ticket_sharing,
gift_giver). There is no payment; a purchase is just a row.
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, col, select

from app.api.v1.quests import record
from app.api.v1.ws import notify
from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.event import Event
from app.models.follow import Follow
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketEvent, TicketGift, TicketPurchase, TicketRead

router = APIRouter()


def _with_events(session: Session, tickets: list[Ticket]) -> list[TicketRead]:
    ids = {t.event_id for t in tickets if t.event_id is not None}
    events = (
        {e.id: e for e in session.exec(select(Event).where(col(Event.id).in_(ids))).all()}
        if ids
        else {}
    )
    return [
        TicketRead.model_validate(t).model_copy(
            update={"event": TicketEvent.model_validate(events[t.event_id]) if t.event_id in events else None}
        )
        for t in tickets
    ]


def _is_connection(session: Session, a_id: int, b_id: int) -> bool:
    follows = session.exec(
        select(Follow).where(Follow.follower_id == a_id, Follow.followed_id == b_id)
    ).first()
    back = session.exec(
        select(Follow).where(Follow.follower_id == b_id, Follow.followed_id == a_id)
    ).first()
    return follows is not None and back is not None


@router.post("/purchase", response_model=list[TicketRead])
def purchase_tickets(
    payload: TicketPurchase,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    if payload.event_id is not None and session.get(Event, payload.event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    tickets = [
        Ticket(user_id=current_user_id, event_id=payload.event_id) for _ in range(payload.quantity)
    ]
    session.add_all(tickets)
    record(session, current_user_id, "ticket_holder", amount=payload.quantity)
    session.commit()
    for ticket in tickets:
        session.refresh(ticket)
    return _with_events(session, tickets)


@router.post("/{ticket_id}/share", status_code=204)
def share_ticket(
    ticket_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Count a share. Nothing is stored about the share itself."""
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not your ticket")
    record(session, current_user_id, "ticket_sharing")
    session.commit()
    return Response(status_code=204)


@router.post("/gift", response_model=TicketRead)
def gift_ticket(
    payload: TicketGift,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    if payload.to_user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot gift yourself a ticket")
    recipient = session.get(User, payload.to_user_id)
    if recipient is None:
        raise HTTPException(status_code=404, detail="User not found")
    event = session.get(Event, payload.event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    if not _is_connection(session, current_user_id, payload.to_user_id):
        raise HTTPException(status_code=403, detail="You can only gift tickets to connections")

    ticket = Ticket(user_id=payload.to_user_id, event_id=event.id, gifted_by=current_user_id)
    session.add(ticket)
    record(session, current_user_id, "gift_giver")
    session.commit()
    session.refresh(ticket)

    me = session.get(User, current_user_id)
    notify(
        session,
        payload.to_user_id,
        "gift",
        actor=me,
        entity_id=ticket.id,
        url="/ticket-vault",
        body=f"{me.display_name or me.username} gifted you a ticket to {event.title}",
    )
    return _with_events(session, [ticket])[0]


@router.get("/", response_model=list[TicketRead])
def list_tickets(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    tickets = session.exec(
        select(Ticket)
        .where(Ticket.user_id == current_user_id)
        .order_by(col(Ticket.purchased_at).desc())
    ).all()
    return _with_events(session, list(tickets))

"""Ticket endpoints.

POST /tickets/purchase    - Buy a ticket (no award yet).
POST /tickets/claim-award - Claim the ticket badge once 5 tickets are bought.
GET  /tickets/            - List tickets for the current user.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user_id
from app.core.badges import badge_id_for
from app.db.session import get_session
from app.models.ticket import Award, Ticket
from app.models.user import User
from app.schemas.ticket import AwardRead, TicketPurchaseResponse, TicketRead

router = APIRouter()

TICKET_AWARD_XP = 50
TICKET_TARGET = 5


@router.post("/purchase", response_model=TicketPurchaseResponse)
def purchase_ticket(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Purchase a ticket. The badge is earned later by claiming it."""
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ticket = Ticket(user_id=current_user_id, ticket_type="standard", award_granted=False)
    session.add(ticket)
    session.commit()
    session.refresh(ticket)

    return TicketPurchaseResponse(ticket=TicketRead.model_validate(ticket))


@router.post("/claim-award", response_model=AwardRead)
def claim_ticket_award(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Claim the ticket badge once the user has bought enough tickets.

    Idempotent: a user who already holds the award gets it back as-is.
    """
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tickets = session.exec(select(Ticket).where(Ticket.user_id == current_user_id)).all()
    if len(tickets) < TICKET_TARGET:
        raise HTTPException(status_code=400, detail="Buy 5 tickets before claiming")

    existing = session.exec(
        select(Award).where(Award.user_id == current_user_id, Award.award_type == "ticket_purchase")
    ).first()
    if existing is not None:
        return AwardRead.model_validate(existing)

    award = Award(
        user_id=current_user_id,
        award_type="ticket_purchase",
        reward_xp=TICKET_AWARD_XP,
        badge_id=badge_id_for(session, current_user_id, "ticket_purchase"),
    )
    session.add(award)
    user.total_xp += TICKET_AWARD_XP
    session.add(user)
    for ticket in tickets:
        ticket.award_granted = True
        session.add(ticket)
    session.commit()
    session.refresh(award)

    return AwardRead.model_validate(award)


@router.get("/", response_model=list[TicketRead])
def list_tickets(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return all tickets purchased by the current user."""
    tickets = session.exec(
        select(Ticket).where(Ticket.user_id == current_user_id).order_by(Ticket.purchased_at.desc())
    ).all()
    return tickets

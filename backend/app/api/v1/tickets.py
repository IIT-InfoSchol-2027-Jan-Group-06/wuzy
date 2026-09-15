"""Ticket endpoints.

POST /tickets/purchase - Buy a ticket.
GET  /tickets/         - List tickets for the current user.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketPurchaseResponse, TicketRead

router = APIRouter()


@router.post("/purchase", response_model=TicketPurchaseResponse)
def purchase_ticket(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Purchase a ticket."""
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ticket = Ticket(user_id=current_user_id, ticket_type="standard", award_granted=False)
    session.add(ticket)
    session.commit()
    session.refresh(ticket)

    return TicketPurchaseResponse(ticket=TicketRead.model_validate(ticket))


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

"""Group chat endpoints.

Groups hold structural data (name + membership) in PostgreSQL. Messages inside
a group are ephemeral and travel over WebSocket/Redis, never stored here.

GET  /groups            - the current user's groups, with members
GET  /groups/{id}       - one group's details
POST /groups            - create a group from the caller's connections
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.follow import Follow
from app.models.group import Group, GroupMember
from app.schemas.group import GroupCreate, GroupRead

router = APIRouter()


@router.get("", response_model=list[GroupRead])
def list_groups(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every group the user is a member of, newest first, with members."""
    memberships = session.exec(
        select(GroupMember).where(GroupMember.user_id == current_user_id)
    ).all()
    if not memberships:
        return []

    group_ids = [m.group_id for m in memberships]
    groups = session.exec(
        select(Group)
        .options(selectinload(Group.members))
        .where(col(Group.id).in_(group_ids))
        .order_by(col(Group.created_at).desc())
    ).all()
    return groups


@router.get("/{group_id}", response_model=GroupRead)
def get_group(
    group_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return one group's details. Accessible to members only."""
    member = session.get(GroupMember, (group_id, current_user_id))
    if not member:
        raise HTTPException(status_code=403, detail="Not a group member")

    group = session.exec(
        select(Group).options(selectinload(Group.members)).where(Group.id == group_id)
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.post("", response_model=GroupRead, status_code=201)
def create_group(
    payload: GroupCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Create a group including the caller plus the chosen member ids.

    Only Connections (mutual follows) may be added, so groups start with people
    the caller already knows.
    """
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Group name cannot be empty")

    # Keep the members the caller actually follows back (their Connections).
    follows = {
        row.followed_id
        for row in session.exec(
            select(Follow).where(Follow.follower_id == current_user_id)
        ).all()
    }
    member_ids = set(payload.member_ids) & follows
    member_ids.discard(current_user_id)

    group = Group(name=name, created_by=current_user_id)
    session.add(group)
    session.flush()
    session.add(GroupMember(group_id=group.id, user_id=current_user_id))
    for member_id in member_ids:
        session.add(GroupMember(group_id=group.id, user_id=member_id))
    session.commit()
    session.refresh(group)
    return group

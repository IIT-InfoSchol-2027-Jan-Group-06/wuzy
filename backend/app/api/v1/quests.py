"""Quests: tiered tasks counted by real actions, claimed for XP and badges.

GET  /quests/               - the caller's dashboard: xp, deck, every quest with tiers
GET  /quests/user/{user_id} - the same for any user (profiles)
POST /quests/{key}/claim    - claim the active tier once its counter hits the target
POST /quests/daily-login    - count today toward the daily streak (server dedupes by date)

Other routers call record() when the counted action happens, so progress can
never be faked from the client.
"""

from collections import defaultdict
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.core.badges import RANK_SLOT, deck_for, rank_for
from app.db.session import get_session
from app.models.quest import Quest, QuestSubtask, QuestSubtaskProgress
from app.models.ticket import Award
from app.models.user import User
from app.schemas.quest import QuestRead, QuestsDashboard, TierRead, XpRead

router = APIRouter()


def record(
    session: Session, user_id: int, key: str, *, amount: int = 1, set_to: int | None = None
) -> None:
    """Advance a user's active tier of a quest. The caller commits.

    Unknown keys and fully claimed quests are no-ops. set_to replaces the
    counter (streaks), amount adds to it.
    """
    row = session.exec(
        select(QuestSubtask, QuestSubtaskProgress)
        .join(Quest, col(Quest.id) == col(QuestSubtask.quest_id))
        .outerjoin(
            QuestSubtaskProgress,
            and_(
                col(QuestSubtaskProgress.subtask_id) == col(QuestSubtask.id),
                col(QuestSubtaskProgress.user_id) == user_id,
            ),
        )
        .where(Quest.key == key)
        .where(
            or_(
                col(QuestSubtaskProgress.id).is_(None),
                col(QuestSubtaskProgress.claimed).is_(False),
            )
        )
        .order_by(col(QuestSubtask.sort_order))
        .limit(1)
    ).first()
    if row is None:
        return
    tier, progress = row
    if progress is None:
        progress = QuestSubtaskProgress(user_id=user_id, subtask_id=tier.id)
    value = set_to if set_to is not None else progress.current_progress + amount
    # ponytail: overflow past the active tier's target is dropped, not carried over.
    progress.current_progress = min(tier.target_count, value)
    session.add(progress)


def dashboard(session: Session, user_id: int) -> QuestsDashboard:
    """Build the whole dashboard with a fixed number of queries."""
    deck = deck_for(session, user_id)
    user = session.get(User, user_id)
    quests = session.exec(select(Quest).order_by(col(Quest.sort_order))).all()
    tiers_by_quest: dict[int, list[QuestSubtask]] = defaultdict(list)
    for tier in session.exec(select(QuestSubtask).order_by(col(QuestSubtask.sort_order))).all():
        tiers_by_quest[tier.quest_id].append(tier)
    progress = {
        p.subtask_id: p
        for p in session.exec(
            select(QuestSubtaskProgress).where(QuestSubtaskProgress.user_id == user_id)
        ).all()
    }

    out = []
    for quest in quests:
        tiers = []
        for tier in tiers_by_quest[quest.id]:
            p = progress.get(tier.id)
            tiers.append(
                TierRead(
                    id=tier.id,
                    name=tier.name,
                    target_count=tier.target_count,
                    progress_unit=tier.progress_unit,
                    reward_xp=tier.reward_xp,
                    current_progress=p.current_progress if p else 0,
                    claimed=bool(p and p.claimed),
                )
            )
        active = next((i for i, t in enumerate(tiers) if not t.claimed), None)
        out.append(
            QuestRead(
                key=quest.key,
                name=quest.name,
                description=quest.description,
                category=quest.category,
                sort_order=quest.sort_order,
                badge_id=deck[quest.sort_order] if quest.sort_order < RANK_SLOT else None,
                tiers=tiers,
                active_tier_index=active,
                claimable=active is not None
                and tiers[active].current_progress >= tiers[active].target_count,
                completed=active is None and bool(tiers),
            )
        )
    return QuestsDashboard(xp=XpRead(**rank_for(user.total_xp)), deck=deck, quests=out)


@router.get("/", response_model=QuestsDashboard)
def get_quests(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    return dashboard(session, current_user_id)


@router.get("/user/{user_id}", response_model=QuestsDashboard)
def get_user_quests(user_id: int, session: Session = Depends(get_session)):
    """Any user's dashboard, for profiles. Public like the rest of the profile data."""
    if session.get(User, user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    return dashboard(session, user_id)


@router.post("/daily-login", response_model=QuestsDashboard)
def daily_login(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Count today toward the streak. Same day is a no-op; a missed day restarts it."""
    # ponytail: the server's UTC day decides, not the phone's clock.
    today = datetime.now(UTC).date()
    user = session.get(User, current_user_id)
    if user.last_login_date != today:
        continues = user.last_login_date == today - timedelta(days=1)
        user.login_streak = user.login_streak + 1 if continues else 1
        user.last_login_date = today
        record(session, current_user_id, "daily_streak", set_to=user.login_streak)
        session.add(user)
        session.commit()
    return dashboard(session, current_user_id)


@router.post("/{key}/claim", response_model=QuestsDashboard)
def claim(
    key: str,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Claim the active tier: XP for every tier, the badge on the last one."""
    quest = session.exec(select(Quest).where(Quest.key == key)).first()
    if quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    deck = deck_for(session, current_user_id)
    tiers = session.exec(
        select(QuestSubtask)
        .where(QuestSubtask.quest_id == quest.id)
        .order_by(col(QuestSubtask.sort_order))
    ).all()
    progress = {
        p.subtask_id: p
        for p in session.exec(
            select(QuestSubtaskProgress).where(
                QuestSubtaskProgress.user_id == current_user_id,
                col(QuestSubtaskProgress.subtask_id).in_([t.id for t in tiers]),
            )
        ).all()
    }
    index = next(
        (i for i, t in enumerate(tiers) if not (progress.get(t.id) and progress[t.id].claimed)),
        None,
    )
    if index is None:
        raise HTTPException(status_code=400, detail="Quest already complete")
    tier = tiers[index]
    row = progress.get(tier.id)
    if row is None or row.current_progress < tier.target_count:
        raise HTTPException(status_code=400, detail="Tier target not reached")

    row.claimed = True
    user = session.get(User, current_user_id)
    user.total_xp += tier.reward_xp
    final = index == len(tiers) - 1
    session.add(
        Award(
            user_id=current_user_id,
            award_type=key,
            tier=index + 1,
            reward_xp=tier.reward_xp,
            badge_id=deck[quest.sort_order] if final and quest.sort_order < RANK_SLOT else None,
        )
    )
    session.add(row)
    session.add(user)
    session.commit()
    return dashboard(session, current_user_id)

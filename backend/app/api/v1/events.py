"""Event recommendations and engagement tracking.

GET  /events/recommended          - personalized, ranked event feed
POST /events/{event_id}/engage    - record a view or "going" signal

Scoring blends three signals plus two small nudges:

  1. Interest match: how much of an event's tags fall inside the user's
     hobbies (Jaccard similarity). This is what puts on-interest events on top.
  2. Tribe heat: engagement on an event weighted by how similar the acting
     user's hobbies are to the requester's. People with tastes like yours
     dragging an event up is the collaborative part, and it drifts over time
     as those engagements land (which is what makes "hot" personal).
  3. Global popularity: recency-weighted engagement from everyone, which keeps
     genuinely big hits visible even when they do not match the user.
  4. A fresh-event bonus and a touch of per-request jitter so the page is not
     a frozen filter bubble: off-interest events still surface, giving the
     user room to discover beyond their hobbies.

Users with no hobbies degrade gracefully to plain popularity + heat, i.e. a
general "what's hot right now" feed.
"""

import math
import random
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, col, select

from app.api.v1.quests import record
from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.event import Event, EventEngagement
from app.models.user import User
from app.schemas.event import EventCategory, EventEngageCreate, EventRead

router = APIRouter()

# An engagement a week old still counts for about a third of one that just
# landed; anything older fades toward zero. Same curve drives both tribe heat
# and popularity, and the fresh-event bonus.
DECAY_HALF_LIFE_HOURS = 24 * 7
KIND_WEIGHT = {"view": 1.0, "going": 3.0}

# Blend weights. Interest dominates so matching events rank top; tribe heat
# comes second (the collaborative "hot for you" signal); then general buzz, a
# small fresh listing nudge, and jitter for discovery.
W_INTEREST = 2.2
W_HOTNESS = 1.4
W_POPULARITY = 0.6
W_FRESH = 0.25
JITTER_MAX = 0.3


def _normalize(words: str | list[str] | None) -> set[str]:
    """Lowercase a word list into a set so "Music" and "music" match."""
    if not words:
        return set()
    if isinstance(words, str):
        words = [words]
    return {w.strip().lower() for w in words if w and w.strip()}


def _decay(age_hours: float) -> float:
    """Recency weight: 1 for a brand-new signal, fading toward 0."""
    return math.exp(-age_hours / DECAY_HALF_LIFE_HOURS)


def _jaccard(a: set[str], b: set[str]) -> float:
    """How much two interest sets overlap, in [0, 1]. 0 for empty sets."""
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def _normalize_log(value: float, peak: float) -> float:
    """Scale a heat sum so the hottest event scores 1.0. log1p dampens the
    gap between one dominant event and a long tail so nothing drowns out."""
    if peak <= 0:
        return 0.0
    return math.log1p(value) / math.log1p(peak)


@router.get("/recommended", response_model=list[EventRead])
def recommended_events(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return every event from today onward, ranked for the current user."""
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # The user's hobbies are their interest vocabulary. An empty set means no
    # signal yet, so the interest term drops out and the feed becomes pure
    # heat + popularity (plain discovery).
    interests = _normalize(user.hobbies)

    # Tribe similarity: how close every other user's hobbies are to the
    # caller's. Zero-overlap users get 0 and do not influence individual heat,
    # but their views still count toward global popularity downward.
    others = session.exec(select(User).where(User.id != current_user_id)).all()
    tribe_sim = {
        other.id: _jaccard(interests, _normalize(other.hobbies))
        for other in others
    }

    # Everything from the start of today onward; the client splits its own
    # "Today" / "Up coming" sections off start_time. Stored timestamps are
    # naive UTC (the DateTime column drops the offset on write), so strip the
    # offset here to keep every comparison in the same domain.
    now = datetime.now(UTC).replace(tzinfo=None)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    events = session.exec(
        select(Event)
        .where(col(Event.start_time) >= start_of_today)
        .order_by(col(Event.start_time))
    ).all()
    if not events:
        return []

    engagements = session.exec(
        select(EventEngagement).where(
            col(EventEngagement.event_id).in_([e.id for e in events])
        )
    ).all()
    by_event: dict[int, list[EventEngagement]] = {e.id: [] for e in events}
    for eng in engagements:
        by_event[eng.event_id].append(eng)

    hot_sum: dict[int, float] = {}
    pop_sum: dict[int, float] = {}
    for event in events:
        hot = 0.0
        pop = 0.0
        for eng in by_event[event.id]:
            # The requester's own signals are not "people like me" heat.
            if eng.user_id == current_user_id:
                continue
            weight = KIND_WEIGHT.get(eng.kind, 1.0)
            age_hours = max((now - eng.created_at).total_seconds() / 3600.0, 0.0)
            decay = _decay(age_hours)
            pop += weight * decay
            hot += tribe_sim.get(eng.user_id, 0.0) * weight * decay
        hot_sum[event.id] = hot
        pop_sum[event.id] = pop

    peak_hot = max(hot_sum.values(), default=0.0)
    peak_pop = max(pop_sum.values(), default=0.0)

    results: list[EventRead] = []
    for event in events:
        match_interest = _jaccard(interests, _normalize(event.tags) | {event.category})
        hotness = _normalize_log(hot_sum[event.id], peak_hot)
        popularity = _normalize_log(pop_sum[event.id], peak_pop)

        # Newly published events get a temporary leg up so fresh listings can
        # be discovered before they have accumulated any engagement.
        age_hours = max((now - event.created_at).total_seconds() / 3600.0, 0.0)
        freshness = _decay(age_hours)
        jitter = random.uniform(0, JITTER_MAX)

        contrib_interest = W_INTEREST * match_interest
        contrib_hot = W_HOTNESS * hotness
        contrib_pop = W_POPULARITY * popularity
        score = contrib_interest + contrib_hot + contrib_pop + W_FRESH * freshness + jitter

        if match_interest > 0 and contrib_interest >= max(contrib_hot, contrib_pop):
            reason = "interest"
        elif contrib_hot >= contrib_pop:
            reason = "trending"
        else:
            reason = "discover"

        results.append(
            EventRead.model_validate(event).model_copy(
                update={"score": round(score, 4), "reason": reason}
            )
        )

    results.sort(key=lambda r: r.score, reverse=True)
    return results


@router.get("/categories", response_model=list[EventCategory])
def suggested_categories(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Category pills for the explore filter bar, ordered for this user.

    A category qualifies when at least one live event in it overlaps the
    user's hobbies (the same vocabulary the feed ranks on), so the pills
    mirror their interests. Categories with no overlap are skipped entirely;
    when nothing matches, the whole catalog is shown by event count rather
    than an empty filter bar.
    """
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    interests = _normalize(user.hobbies)

    now = datetime.now(UTC).replace(tzinfo=None)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    events = session.exec(
        select(Event).where(col(Event.start_time) >= start_of_today)
    ).all()

    per_category: dict[str, list[Event]] = {}
    for event in events:
        per_category.setdefault(event.category, []).append(event)

    # How well a category fits the user: the strongest interest overlap among
    # all of its live events, matching the feed's per-event scoring.
    def best_match(category: str, category_events: list[Event]) -> float:
        return max(
            _jaccard(interests, _normalize(ev.tags) | {ev.category})
            for ev in category_events
        )

    if interests:
        ordered = [
            category
            for category, category_events in per_category.items()
            if best_match(category, category_events) > 0
        ]
        ordered.sort(
            key=lambda category: best_match(category, per_category[category]),
            reverse=True,
        )
        if not ordered:
            ordered = sorted(
                per_category,
                key=lambda category: len(per_category[category]),
                reverse=True,
            )
    else:
        ordered = sorted(
            per_category,
            key=lambda category: len(per_category[category]),
            reverse=True,
        )

    return [EventCategory(id=category, label=category.capitalize()) for category in ordered]


@router.get("/{event_id}", response_model=EventRead)
def get_event(
    event_id: int,
    session: Session = Depends(get_session),
):
    """A single event for the details and ticket screens."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/{event_id}/engage", status_code=204)
def engage_event(
    event_id: int,
    payload: EventEngageCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Record a signal on an event and re-rank the feed behind it.

    Allows only "view" and "going". Calling again with "going" upgrades an
    existing "view" to "going" (an RSVP is a stronger signal); repeats are
    idempotent no-ops. Every recorded engagement feeds the heat scores, so the
    recommended feed shifts as people like the requester engage.
    """
    if payload.kind not in KIND_WEIGHT:
        raise HTTPException(status_code=422, detail="kind must be 'view' or 'going'")

    if not session.get(Event, event_id):
        raise HTTPException(status_code=404, detail="Event not found")

    existing = session.exec(
        select(EventEngagement).where(
            EventEngagement.user_id == current_user_id,
            EventEngagement.event_id == event_id,
        )
    ).first()

    going = False
    if existing is None:
        session.add(
            EventEngagement(
                user_id=current_user_id,
                event_id=event_id,
                kind=payload.kind,
            )
        )
        going = payload.kind == "going"
    elif payload.kind == "going" and existing.kind != "going":
        existing.kind = "going"
        going = True
    if going:
        record(session, current_user_id, "explorer")
    session.commit()
    return Response(status_code=204)

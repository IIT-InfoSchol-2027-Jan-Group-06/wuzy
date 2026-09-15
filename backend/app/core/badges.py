"""Badge deck helpers: every user's personal sticker deck.

Each user gets a deterministic shuffle of the 15 badge ids, seeded by their
user id so the same account always sees the same stickers. The deck is stored
on the user row the first time it is needed, and each Award records the badge
id it granted so the profile can show exactly which sticker was earned.
"""

from sqlmodel import Session

from app.models.user import User

BADGE_COUNT = 15

# Canonical order for assigning badge ids to quests/custom tasks. Mirrors the
# slot order the frontend uses so a quest maps to the same kind of badge for
# every user; only *which* badge art that slot holds changes per user.
AWARD_SLOTS = [
    "Daily Login",
    "Social Network",
    "Purchase Ticket",
    "Complete Profile",
    "Ticket Sharing",
]


def badge_slot(award_type: str) -> int:
    """Return the canonical slot index for an award type, or None."""
    if award_type == "ticket_purchase":
        award_type = "Purchase Ticket"
    elif award_type == "profile_complete":
        award_type = "Complete Profile"
    try:
        return AWARD_SLOTS.index(award_type)
    except ValueError:
        return -1


def build_deck(user_id: int) -> list[int]:
    """A deterministic Fisher-Yates shuffle of badge ids 1..15 for a user.

    Pure function so a deck can be rebuilt from the same user id on different
    devices; no randomness source is involved.
    """
    deck = list(range(1, BADGE_COUNT + 1))
    seed = user_id * 2654435761 % (2**32)
    for i in range(len(deck) - 1, 0, -1):
        seed = (seed * 6364136223846793005 + 1442695040888963407) % (2**64)
        j = (seed >> 32) % (i + 1)
        deck[i], deck[j] = deck[j], deck[i]
    return deck


def deck_for(session: Session, user_id: int) -> list[int]:
    """Return the user's badge deck, persisting it on first use."""
    user = session.get(User, user_id)
    if user is None:
        return list(range(1, BADGE_COUNT + 1))
    if not user.badge_deck:
        user.badge_deck = build_deck(user_id)
        session.add(user)
        session.commit()
        session.refresh(user)
    return user.badge_deck


def badge_id_for(session: Session, user_id: int, award_type: str) -> int | None:
    """The badge id a user's deck grants for an award type, or None."""
    slot = badge_slot(award_type)
    if slot < 0:
        return None
    deck = deck_for(session, user_id)
    if slot >= len(deck):
        return None
    return deck[slot]

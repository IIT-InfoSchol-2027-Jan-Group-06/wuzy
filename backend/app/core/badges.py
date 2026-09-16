"""Badge decks and ranks.

Every user gets a deterministic shuffle of the 15 badge ids, seeded by their
user id, stored on the user row the first time it is needed. Deck slots 0..9
are the badges quests grant (by the quest's sort_order); slots 10..13 are the
art for the four ranks.
"""

from sqlmodel import Session

from app.models.user import User

BADGE_COUNT = 15
RANK_SLOT = 10

RANKS = [("Bronze", 0), ("Silver", 250), ("Gold", 600), ("Diamond", 1100)]


def rank_for(total_xp: int) -> dict:
    """The rank a total XP sits in, plus the thresholds the XP bar needs."""
    index = max(i for i, (_, threshold) in enumerate(RANKS) if total_xp >= threshold)
    nxt = RANKS[index + 1] if index + 1 < len(RANKS) else None
    return {
        "total_xp": total_xp,
        "rank": RANKS[index][0],
        "rank_index": index,
        "next_rank": nxt[0] if nxt else None,
        "rank_threshold": RANKS[index][1],
        "next_threshold": nxt[1] if nxt else None,
    }


def build_deck(user_id: int) -> list[int]:
    """A deterministic Fisher-Yates shuffle of badge ids 1..15 for a user."""
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

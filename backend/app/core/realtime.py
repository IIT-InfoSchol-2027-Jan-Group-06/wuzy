"""Real-time messaging plumbing.

Redis holds only ephemeral runtime data, never durable message history:
- Session registry: `session:{user_id}` -> "active" while the user's socket is open
- Offline mailbox: `offline:{user_id}` -> a FIFO queue of undelivered payloads

When a sender routes a message we check the recipient's registry entry. If they
are online we push straight to their open socket; otherwise we push into their
offline queue and it is replayed on their next connect, then deleted so no
message content lingers.
"""

import json

import redis

from app.core.config import settings

SESSION_PREFIX = "session:{user_id}"
OFFLINE_PREFIX = "offline:{user_id}"

client = redis.Redis.from_url(settings.redis_url, decode_responses=True)


def is_online(user_id: int) -> bool:
    """True if the user currently has an active WebSocket registered."""
    return bool(client.exists(SESSION_PREFIX.format(user_id=user_id)))


def register_online(user_id: int) -> None:
    """Mark the user as online so senders can route directly to their socket."""
    client.set(SESSION_PREFIX.format(user_id=user_id), "active")


def register_offline(user_id: int) -> None:
    """Clear the user's registry entry on disconnect."""
    client.delete(SESSION_PREFIX.format(user_id=user_id))


def queue_offline(user_id: int, payload: dict) -> None:
    """Push an undelivered payload onto the user's offline mailbox."""
    client.lpush(OFFLINE_PREFIX.format(user_id=user_id), json.dumps(payload))


def replay_offline(user_id: int) -> list[dict]:
    """Drain and return every queued payload oldest-first, then delete the queue.

    The list is LPUSHed with newest at the head, so lrange 0..-1 reads
    newest-first; reversing yields the intended FIFO delivery order.
    """
    key = OFFLINE_PREFIX.format(user_id=user_id)
    head_to_tail = client.lrange(key, 0, -1)
    if not head_to_tail:
        return []
    client.delete(key)
    return [json.loads(item) for item in reversed(head_to_tail)]

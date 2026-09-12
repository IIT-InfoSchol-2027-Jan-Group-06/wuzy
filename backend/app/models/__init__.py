"""Model registry.

Importing every model here guarantees they are all registered on SQLModel
metadata before table creation or autogenerate runs, even if a caller only
imports the package (e.g. app.db.session imports app.models).
"""

from app.models.conversation import Conversation, ConversationMember
from app.models.event import Event, EventEngagement
from app.models.follow import Follow
from app.models.group import Group, GroupMember
from app.models.post import Post
from app.models.post_view import PostView
from app.models.push_token import PushToken
from app.models.quest import Quest, QuestSubtask, QuestSubtaskProgress
from app.models.referral import ReferralRequest
from app.models.ticket import Award, Ticket
from app.models.user import User

__all__ = [
    "User",
    "Post",
    "PostView",
    "Follow",
    "Conversation",
    "ConversationMember",
    "Group",
    "GroupMember",
    "PushToken",
    "Quest",
    "QuestSubtask",
    "QuestSubtaskProgress",
    "Event",
    "EventEngagement",
    "ReferralRequest",
    "Ticket",
    "Award",
]

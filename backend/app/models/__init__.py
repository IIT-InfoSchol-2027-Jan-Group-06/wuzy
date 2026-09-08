"""Model registry.

Importing every model here guarantees they are all registered on SQLModel
metadata before table creation or autogenerate runs, even if a caller only
imports the package (e.g. app.db.session imports app.models).
"""

from app.models.conversation import Conversation, ConversationMember
from app.models.follow import Follow
from app.models.message import Message
from app.models.post import Post
from app.models.post_view import PostView
from app.models.user import User

__all__ = ["User", "Post", "PostView", "Follow", "Conversation", "ConversationMember", "Message"]

"""Feed endpoints.

GET  /feed/discover              - Ephemeral posts alive for this session + public permanent posts
POST /feed/{post_id}/view        - Record that the user viewed a post (204)
GET  /feed/profile/{user_id}     - Permanent profile posts for a user

The discover feed is the heart of the app. It mixes two kinds of posts:
  1. Ephemeral (save_to_profile=False): visible for the whole app session in
     which they are seen. Once the app is closed and reopened (a new session),
     the posts viewed in past sessions are gone. This creates the "Instants"
     effect.
  2. Permanent (save_to_profile=True): always visible, like a normal Instagram
     post on someone's profile grid.

Both kinds are restricted to posts from people the current user follows
(or their own posts). Requests carry the current app session id in the
X-Session-Id header; views are tagged with it so the feed can tell a view
from this session apart from one from a previous launch.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy import or_
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.api.v1.posts import with_likes
from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.follow import Follow
from app.models.post import Post
from app.models.post_view import PostView
from app.schemas.post import PostRead

router = APIRouter()


@router.get("/discover", response_model=list[PostRead])
def discover_feed(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    x_session_id: str | None = Header(default=None),
):
    """Return posts the current user can discover.

    The query has two branches combined with OR:
      - Ephemeral posts NOT viewed in a past session (views tied to the current
        session id are still visible)
      - All permanent posts (always shown regardless of views)

    Both branches are scoped to authors the user follows plus themselves.
    selectinload eagerly loads the author object to avoid N+1 queries on
    the frontend side.
    """
    # Build the set of author IDs whose posts are eligible:
    # the current user + everyone they follow.
    followed_ids = [
        f.followed_id
        for f in session.exec(
            select(Follow).where(Follow.follower_id == current_user_id)
        ).all()
    ]
    author_ids = {current_user_id, *followed_ids}

    # Post IDs the user viewed in a session other than the current one.
    # Views with no session id (legacy rows) count as a past session so they
    # keep hiding posts. Views recorded in THIS session do not hide anything:
    # ephemeral posts last until the app is opened again.
    seen_before = select(PostView.post_id).where(
        PostView.user_id == current_user_id,
        or_(PostView.session_id.is_(None), PostView.session_id != x_session_id),
    )
    ephemeral_unviewed = (Post.save_to_profile == False) & ~col(Post.id).in_(seen_before)  # noqa: E712

    permanent = Post.save_to_profile == True  # noqa: E712
    stmt = (
        select(Post)
        .options(selectinload(Post.user))
        .where(col(Post.user_id).in_(author_ids))
        .where(ephemeral_unviewed | permanent)
    )

    posts = session.exec(stmt.order_by(col(Post.created_at).desc())).all()
    return with_likes(session, posts, current_user_id)


@router.post("/{post_id}/view", status_code=204)
def record_view(
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    x_session_id: str | None = Header(default=None),
):
    """Record that the current user viewed a post.

    The frontend calls this when a post card scrolls into view. The view is
    tagged with the current app session, so the post stays in the discover
    feed until the app is reopened with a fresh session id, then it is hidden.
    Idempotent: duplicate calls are safe no-ops.
    """
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if view already recorded to keep the endpoint idempotent.
    existing = session.exec(
        select(PostView).where(
            PostView.user_id == current_user_id,
            PostView.post_id == post_id,
        )
    ).first()

    if not existing:
        view = PostView(
            user_id=current_user_id,
            post_id=post_id,
            session_id=x_session_id,
        )
        session.add(view)
        session.commit()

    return Response(status_code=204)


@router.get("/profile/{user_id}", response_model=list[PostRead])
def profile_feed(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Return all permanent profile posts for a given user, newest first.

    Only posts where save_to_profile=True are included. Ephemeral posts
    never appear on a profile grid, even if the author views them.
    """
    posts = session.exec(
        select(Post)
        .options(selectinload(Post.user))
        .where(Post.user_id == user_id, Post.save_to_profile == True)  # noqa: E712
        .order_by(col(Post.created_at).desc())
    ).all()
    return with_likes(session, posts, current_user_id)

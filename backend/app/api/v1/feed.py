"""Feed endpoints.

GET  /feed/discover              - Ephemeral posts the user hasn't viewed + public permanent posts
POST /feed/{post_id}/view        - Record that the user viewed a post (204)
GET  /feed/profile/{user_id}     - Permanent profile posts for a user

The discover feed is the heart of the app. It mixes two kinds of posts:
  1. Ephemeral (save_to_profile=False): visible until the current user views
     them, then they vanish. This creates the "Instants" effect.
  2. Permanent (save_to_profile=True): always visible, like a normal Instagram
     post on someone's profile grid.

Both kinds are restricted to posts from people the current user follows
(or their own posts).
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

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
):
    """Return posts the current user can discover.

    The query has two branches combined with OR:
      - Ephemeral posts NOT in the user's post_view rows (unseen)
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

    # Fetch all post IDs this user has already viewed. Ephemeral posts in
    # this set will be excluded from the results.
    viewed_post_ids = [
        pv.post_id
        for pv in session.exec(
            select(PostView).where(PostView.user_id == current_user_id)
        ).all()
    ]

    # Build the filter: (ephemeral AND unviewed) OR permanent.
    if viewed_post_ids:
        ephemeral_unviewed = (Post.save_to_profile == False) & ~col(Post.id).in_(viewed_post_ids)  # noqa: E712
    else:
        # No views yet: every ephemeral post is eligible.
        ephemeral_unviewed = Post.save_to_profile == False  # noqa: E712

    permanent = Post.save_to_profile == True  # noqa: E712
    stmt = (
        select(Post)
        .options(selectinload(Post.user))
        .where(col(Post.user_id).in_(author_ids))
        .where(ephemeral_unviewed | permanent)
    )

    posts = session.exec(stmt.order_by(col(Post.created_at).desc())).all()
    return posts


@router.post("/{post_id}/view", status_code=204)
def record_view(
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Record that the current user viewed a post.

    The frontend calls this when a post card scrolls into view. For ephemeral
    posts, this causes the post to disappear from the user's discover feed
    on next fetch. Idempotent: duplicate calls are safe no-ops.
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
        view = PostView(user_id=current_user_id, post_id=post_id)
        session.add(view)
        session.commit()

    return Response(status_code=204)


@router.get("/profile/{user_id}", response_model=list[PostRead])
def profile_feed(
    user_id: int,
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
    return posts

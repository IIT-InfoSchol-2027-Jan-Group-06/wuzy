"""Feed endpoints.

GET  /feed/discover              - Ephemeral posts the user hasn't viewed + public permanent posts
POST /posts/{post_id}/view       - Record that the user viewed a post (204)
GET  /feed/profile/{user_id}     - Permanent profile posts for a user
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.auth import get_current_user_id
from app.db.session import get_session
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

    Includes:
    - Ephemeral posts (save_to_profile=False) the user has NOT viewed yet
    - Permanent profile posts (save_to_profile=True) from all authors

    Ephemeral posts disappear from this feed once the user views them.
    """
    # IDs of posts this user has already viewed
    viewed_post_ids = [
        pv.post_id
        for pv in session.exec(
            select(PostView).where(PostView.user_id == current_user_id)
        ).all()
    ]

    # Query: (ephemeral AND not yet viewed by this user) OR permanent
    if viewed_post_ids:
        ephemeral_unviewed = (Post.save_to_profile == False) & ~col(Post.id).in_(viewed_post_ids)  # noqa: E712
    else:
        # No views yet: all ephemeral posts are eligible
        ephemeral_unviewed = Post.save_to_profile == False  # noqa: E712

    permanent = Post.save_to_profile == True  # noqa: E712
    stmt = select(Post).options(selectinload(Post.user)).where(ephemeral_unviewed | permanent)

    posts = session.exec(stmt.order_by(col(Post.created_at).desc())).all()
    return posts


@router.post("/{post_id}/view", status_code=204)
def record_view(
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Record that the current user viewed a post.

    Idempotent: viewing the same post twice is a no-op.
    """
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if view already recorded
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

    Only posts where save_to_profile=True are included.
    """
    posts = session.exec(
        select(Post)
        .options(selectinload(Post.user))
        .where(Post.user_id == user_id, Post.save_to_profile == True)  # noqa: E712
        .order_by(col(Post.created_at).desc())
    ).all()
    return posts

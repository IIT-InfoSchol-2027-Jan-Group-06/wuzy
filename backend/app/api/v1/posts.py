"""Post CRUD endpoints.

POST /posts               - Create an ephemeral or permanent post
POST /posts/{id}/pin-to-profile - Promote an ephemeral post to permanent
POST /posts/{id}/like     - Toggle the caller's like; the author is notified on like

The save_to_profile flag is what drives the feed's core behavior:
ephemeral posts vanish from a viewer's feed after they see them,
permanent posts stick around on the author's profile grid forever.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, col, select

from app.api.v1.ws import notify
from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.post import Post
from app.models.post_like import PostLike
from app.models.user import User
from app.schemas.post import PostCreate, PostRead

router = APIRouter()


def with_likes(session: Session, posts: list[Post], viewer_id: int) -> list[PostRead]:
    """Serialize posts with their like count and whether the viewer liked each."""
    ids = [p.id for p in posts]
    if not ids:
        return []
    counts = dict(
        session.exec(
            select(PostLike.post_id, func.count())
            .where(col(PostLike.post_id).in_(ids))
            .group_by(PostLike.post_id)
        ).all()
    )
    mine = set(
        session.exec(
            select(PostLike.post_id).where(
                col(PostLike.post_id).in_(ids), PostLike.user_id == viewer_id
            )
        ).all()
    )
    return [
        PostRead.model_validate(p).model_copy(
            update={"like_count": counts.get(p.id, 0), "liked_by_me": p.id in mine}
        )
        for p in posts
    ]


@router.post("/", response_model=PostRead, status_code=201)
def create_post(
    payload: PostCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Create a new post.

    - save_to_profile=False  -> ephemeral (one-time view, hides after viewed)
    - save_to_profile=True   -> permanent (stays on author's profile grid)

    The post is immediately visible in followers' discover feeds on next fetch.
    """
    post = Post(
        media_url=payload.media_url,
        caption=payload.caption,
        location=payload.location,
        save_to_profile=payload.save_to_profile,
        user_id=current_user_id,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return with_likes(session, [post], current_user_id)[0]


@router.post("/{post_id}/pin-to-profile", response_model=PostRead)
def pin_to_profile(
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Promote an existing ephemeral post to a permanent profile post.

    Only the original author can pin their own post. This is a one-way
    operation: once pinned, the post stays on the profile permanently.
    The post will also stop being filtered out by the view-tracking system
    since the discover query always includes permanent posts.
    """
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Only the author can pin this post")

    if post.save_to_profile:
        raise HTTPException(status_code=400, detail="Post is already saved to profile")

    post.save_to_profile = True
    session.add(post)
    session.commit()
    session.refresh(post)
    return with_likes(session, [post], current_user_id)[0]


@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Toggle the caller's like on a post. Returns the new state and count."""
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = session.exec(
        select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user_id)
    ).first()
    if existing is not None:
        session.delete(existing)
        session.commit()
        liked = False
    else:
        session.add(PostLike(post_id=post_id, user_id=current_user_id))
        try:
            session.commit()
            liker = session.get(User, current_user_id)
            notify(
                session,
                post.user_id,
                "like",
                actor=liker,
                entity_id=post.id,
                url=f"/profile/{liker.id}",
                body=f"{liker.display_name or liker.username} liked your post",
            )
        except IntegrityError:
            # A double tap raced us; the like already exists.
            session.rollback()
        liked = True

    count = session.exec(
        select(func.count()).select_from(PostLike).where(PostLike.post_id == post_id)
    ).one()
    return {"liked": liked, "like_count": count}

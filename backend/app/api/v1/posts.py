"""Post CRUD endpoints.

POST /posts               - Create an ephemeral or permanent post
POST /posts/{id}/pin-to-profile - Promote an ephemeral post to permanent

The save_to_profile flag is what drives the feed's core behavior:
ephemeral posts vanish from a viewer's feed after they see them,
permanent posts stick around on the author's profile grid forever.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.auth import get_current_user_id
from app.db.session import get_session
from app.models.post import Post
from app.schemas.post import PostCreate, PostRead

router = APIRouter()


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
    return post


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
    return post

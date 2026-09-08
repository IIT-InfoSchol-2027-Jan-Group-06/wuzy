"""FastAPI application entrypoint.

Wires up middleware, mounts all routers under their versioned prefixes, and
serves uploaded media from the storage directory. The lifespan hook creates
tables on startup for local dev; Alembic handles migrated schemas elsewhere.
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import auth, awards, chat, feed, groups, posts, upload, users, ws
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database tables on startup."""
    init_db()
    yield


app = FastAPI(title="Wuzy API", lifespan=lifespan)

# CORS is wide open for the Expo web dev server. Tighten the allowed origins
# once there is a real deployed frontend host.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Each router is mounted under its own prefix so routes stay namespaced
# (e.g. /feed/discover, /chat/conversations).
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(posts.router, prefix="/posts", tags=["posts"])
app.include_router(feed.router, prefix="/feed", tags=["feed"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(awards.router, prefix="/awards", tags=["awards"])
app.include_router(ws.router, prefix="/ws", tags=["ws"])

# Serve uploaded files from the storage directory so /uploads/* URLs resolve.
storage_dir = Path("storage")
storage_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=storage_dir), name="uploads")


@app.get("/health")
def health():
    """Liveness check used by docker-compose and for manual smoke tests."""
    return {"status": "ok"}

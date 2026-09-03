from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.v1 import feed, posts, upload, users
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database tables on startup."""
    init_db()
    yield


app = FastAPI(title="Wuzy API", lifespan=lifespan)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(posts.router, prefix="/posts", tags=["posts"])
app.include_router(feed.router, prefix="/feed", tags=["feed"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])

# Serve uploaded files from the storage directory
storage_dir = Path("storage")
storage_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=storage_dir), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}

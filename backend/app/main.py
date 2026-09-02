from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1 import feed, posts, users
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


@app.get("/health")
def health():
    return {"status": "ok"}

from fastapi import FastAPI
from app.api.v1 import users
from app.db.session import init_db

app = FastAPI(title="Wuzy API")


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(users.router, prefix="/users", tags=["users"])


@app.get("/health")
def health():
    return {"status": "ok"}
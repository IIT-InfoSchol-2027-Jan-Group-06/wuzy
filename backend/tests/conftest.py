"""Shared fixtures. Tests run against the real migrated and seeded Postgres.

There is no rollback machinery: throwaway users get uuid names so every test
file is rerunnable, and seeded accounts are only read.
"""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

SEED_EMAIL = "abhiruk@test.com"
SEED_PASSWORD = "password123"


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def no_push(monkeypatch):
    """Never call Expo from a test; pushes fire on daemon threads."""
    monkeypatch.setattr("app.api.v1.ws.send_push", lambda *a, **k: None)


def login(client, email, password=SEED_PASSWORD) -> dict:
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def make_user(client) -> tuple[dict, dict]:
    """Create a throwaway user. Returns (user json, auth headers)."""
    name = f"u{uuid.uuid4().hex[:8]}"
    payload = {"email": f"{name}@t.com", "username": name, "hashed_password": "password"}
    res = client.post("/users/", json=payload)
    assert res.status_code == 201, res.text
    user = res.json()
    return user, login(client, user["email"], "password")


def connect(client, a, a_headers, b, b_headers) -> None:
    """Make two users Connections (mutual follow)."""
    assert client.post(f"/users/{b['id']}/connect", headers=a_headers).status_code == 200
    assert client.post(f"/users/{a['id']}/connect", headers=b_headers).status_code == 200


@pytest.fixture
def seed_headers(client):
    return login(client, SEED_EMAIL)


@pytest.fixture
def user(client):
    return make_user(client)


@pytest.fixture
def pair(client):
    """Two connected throwaway users: ((a, a_headers), (b, b_headers))."""
    a, ah = make_user(client)
    b, bh = make_user(client)
    connect(client, a, ah, b, bh)
    return (a, ah), (b, bh)

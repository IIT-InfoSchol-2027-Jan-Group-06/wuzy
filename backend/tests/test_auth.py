import uuid

from tests.conftest import SEED_EMAIL, SEED_PASSWORD


def test_login_ok(client):
    res = client.post("/auth/login", json={"email": SEED_EMAIL, "password": SEED_PASSWORD})
    assert res.status_code == 200
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == SEED_EMAIL
    assert "hashed_password" not in body["user"]


def test_login_wrong_password(client):
    res = client.post("/auth/login", json={"email": SEED_EMAIL, "password": "nope"})
    assert res.status_code == 401


def test_me(client, seed_headers):
    res = client.get("/auth/me", headers=seed_headers)
    assert res.status_code == 200
    assert res.json()["email"] == SEED_EMAIL


def test_me_requires_token(client):
    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_push_token(client, user):
    _, headers = user
    # Tokens are unique across users, so a fixed string would collide on rerun.
    for _ in range(2):
        token = f"ExponentPushToken[{uuid.uuid4().hex}]"
        res = client.post("/auth/push-token", json={"token": token}, headers=headers)
        assert res.status_code == 204

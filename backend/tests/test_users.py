import uuid

from tests.conftest import make_user


def test_create_and_read(client, user):
    created, _ = user
    assert "hashed_password" not in created
    assert client.get(f"/users/{created['id']}").json()["username"] == created["username"]
    assert client.get(f"/users/by-username/{created['username']}").json()["id"] == created["id"]
    assert any(u["id"] == created["id"] for u in client.get("/users/").json())


def test_not_found(client):
    assert client.get("/users/by-username/nobody-here").status_code == 404
    assert client.get("/users/999999").status_code == 404
    assert client.get("/users/999999/connections").status_code == 404


def test_connect_is_mutual_and_idempotent(client):
    a, ah = make_user(client)
    b, _ = make_user(client)
    for _ in range(2):
        res = client.post(f"/users/{b['id']}/connect", headers=ah)
        assert res.status_code == 200
        assert res.json()["id"] == b["id"]
    assert [u["id"] for u in client.get(f"/users/{a['id']}/connections").json()] == [b["id"]]
    assert [u["id"] for u in client.get(f"/users/{b['id']}/connections").json()] == [a["id"]]


def test_connect_errors(client, user):
    me, headers = user
    assert client.post(f"/users/{me['id']}/connect", headers=headers).status_code == 400
    assert client.post("/users/999999/connect", headers=headers).status_code == 404
    assert client.post("/users/1/connect").status_code == 401


def test_signup_stores_profile_fields(client):
    name = f"u{uuid.uuid4().hex[:8]}"
    payload = {
        "email": f"{name}@t.com",
        "username": name,
        "hashed_password": "password",
        "display_name": "New Person",
        "gender": "Woman",
        "birthday": "2004-01-31",
        "hobbies": ["Music", "Tech"],
    }
    res = client.post("/users/", json=payload)
    assert res.status_code == 201, res.text
    body = res.json()
    for key in ("display_name", "gender", "birthday", "hobbies"):
        assert body[key] == payload[key]


def test_signup_rejects_duplicates_and_weak_input(client, user):
    existing, _ = user
    fresh = f"u{uuid.uuid4().hex[:8]}"
    base = {"hashed_password": "password"}
    dup_email = {**base, "email": existing["email"], "username": fresh}
    assert client.post("/users/", json=dup_email).status_code == 409
    dup_name = {**base, "email": f"{fresh}@t.com", "username": existing["username"]}
    assert client.post("/users/", json=dup_name).status_code == 409
    short = {"email": f"{fresh}@t.com", "username": fresh, "hashed_password": "short"}
    assert client.post("/users/", json=short).status_code == 422
    bad_email = {**base, "email": "not-an-email", "username": fresh}
    assert client.post("/users/", json=bad_email).status_code == 422


def test_availability(client, user):
    existing, _ = user
    fresh = f"u{uuid.uuid4().hex[:8]}"
    res = client.get("/users/availability", params={"email": existing["email"], "username": fresh})
    assert res.json() == {"email": False, "username": True}
    res = client.get("/users/availability", params={"username": existing["username"]})
    assert res.json() == {"email": True, "username": False}

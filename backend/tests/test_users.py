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

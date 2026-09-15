from tests.conftest import make_user


def test_create_post(client, user):
    me, headers = user
    res = client.post("/posts/", json={"media_url": "/uploads/post/x.png"}, headers=headers)
    assert res.status_code == 201
    body = res.json()
    assert body["user_id"] == me["id"]
    assert body["save_to_profile"] is False


def test_pin_to_profile(client, user):
    _, headers = user
    post = client.post("/posts/", json={"media_url": "/x.png"}, headers=headers).json()
    res = client.post(f"/posts/{post['id']}/pin-to-profile", headers=headers)
    assert res.status_code == 200
    assert res.json()["save_to_profile"] is True
    assert client.post(f"/posts/{post['id']}/pin-to-profile", headers=headers).status_code == 400


def test_pin_only_author(client, user):
    _, headers = user
    post = client.post("/posts/", json={"media_url": "/x.png"}, headers=headers).json()
    _, other_headers = make_user(client)
    assert client.post(f"/posts/{post['id']}/pin-to-profile", headers=other_headers).status_code == 403
    assert client.post("/posts/999999/pin-to-profile", headers=headers).status_code == 404


def test_like_toggle_notifies_author(client, user):
    me, headers = user
    post = client.post("/posts/", json={"media_url": "/x.png"}, headers=headers).json()
    assert post["like_count"] == 0 and post["liked_by_me"] is False
    other, other_headers = make_user(client)

    assert client.post(f"/posts/{post['id']}/like", headers=other_headers).json() == {
        "liked": True,
        "like_count": 1,
    }
    rows = client.get("/notifications", headers=headers).json()
    assert [(n["type"], n["actor_id"], n["entity_id"]) for n in rows] == [
        ("like", other["id"], post["id"])
    ]
    assert rows[0]["payload"]["url"] == f"/profile/{other['id']}"
    assert client.get(f"/feed/profile/{me['id']}", headers=other_headers).json() == []

    # Liking my own post counts but never notifies me.
    assert client.post(f"/posts/{post['id']}/like", headers=headers).json()["like_count"] == 2
    assert len(client.get("/notifications", headers=headers).json()) == 1

    assert client.post(f"/posts/{post['id']}/like", headers=other_headers).json() == {
        "liked": False,
        "like_count": 1,
    }
    assert client.post("/posts/999999/like", headers=headers).status_code == 404

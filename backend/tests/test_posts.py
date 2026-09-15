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

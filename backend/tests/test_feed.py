def _ids(res):
    assert res.status_code == 200, res.text
    return {p["id"] for p in res.json()}


def test_ephemeral_hides_after_a_new_session(client, user):
    me, headers = user
    ephemeral = client.post("/posts/", json={"media_url": "/e.png"}, headers=headers).json()
    permanent = client.post(
        "/posts/", json={"media_url": "/p.png", "save_to_profile": True}, headers=headers
    ).json()
    s1 = {**headers, "X-Session-Id": "s1"}
    s2 = {**headers, "X-Session-Id": "s2"}

    assert {ephemeral["id"], permanent["id"]} <= _ids(client.get("/feed/discover", headers=s1))

    assert client.post(f"/feed/{ephemeral['id']}/view", headers=s1).status_code == 204
    assert client.post(f"/feed/{ephemeral['id']}/view", headers=s1).status_code == 204

    assert ephemeral["id"] in _ids(client.get("/feed/discover", headers=s1))
    seen_in_new_session = _ids(client.get("/feed/discover", headers=s2))
    assert ephemeral["id"] not in seen_in_new_session
    assert permanent["id"] in seen_in_new_session

    assert _ids(client.get(f"/feed/profile/{me['id']}")) == {permanent["id"]}


def test_view_unknown_post(client, user):
    _, headers = user
    assert client.post("/feed/999999/view", headers=headers).status_code == 404

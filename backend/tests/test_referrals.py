from tests.conftest import connect, make_user


def _triple(client):
    """Sender connected to two recipients who are strangers to each other."""
    sender, sh = make_user(client)
    x, xh = make_user(client)
    y, yh = make_user(client)
    connect(client, sender, sh, x, xh)
    connect(client, sender, sh, y, yh)
    return (sender, sh), (x, xh), (y, yh)


def test_accept_flow(client):
    (sender, sh), (x, xh), (y, yh) = _triple(client)
    payload = {"first_user_id": x["id"], "second_user_id": y["id"]}
    res = client.post("/referrals", json=payload, headers=sh)
    assert res.status_code == 200
    ref = res.json()
    assert ref["status"] == "pending"
    assert client.post("/referrals", json=payload, headers=sh).json()["id"] == ref["id"]

    assert [r["id"] for r in client.get("/referrals/outgoing", headers=sh).json()] == [ref["id"]]
    inbox = client.get("/notifications", headers=xh).json()
    assert [n["entity_id"] for n in inbox if n["type"] == "referral"] == [ref["id"]]
    assert "referral" not in {n["type"] for n in client.get("/notifications", headers=sh).json()}

    res = client.post(f"/referrals/{ref['id']}/respond", json={"accept": True}, headers=xh)
    assert res.json()["status"] == "pending"
    res = client.post(f"/referrals/{ref['id']}/respond", json={"accept": True}, headers=yh)
    assert res.json()["status"] == "accepted"
    connections = {u["id"] for u in client.get(f"/users/{x['id']}/connections").json()}
    assert connections == {sender["id"], y["id"]}

    for _ in range(2):
        res = client.post(f"/referrals/{ref['id']}/consume", headers=sh)
        assert res.status_code == 200
        assert res.json()["consumed"] is True


def test_decline_voids(client):
    (_, sh), (x, xh), (y, _) = _triple(client)
    ref = client.post(
        "/referrals", json={"first_user_id": x["id"], "second_user_id": y["id"]}, headers=sh
    ).json()
    res = client.post(f"/referrals/{ref['id']}/respond", json={"accept": False}, headers=xh)
    assert res.json()["status"] == "declined"
    assert y["id"] not in {u["id"] for u in client.get(f"/users/{x['id']}/connections").json()}


def test_errors(client):
    (sender, sh), (x, xh), (y, _) = _triple(client)
    res = client.post(
        "/referrals", json={"first_user_id": sender["id"], "second_user_id": x["id"]}, headers=sh
    )
    assert res.status_code == 400
    ref = client.post(
        "/referrals", json={"first_user_id": x["id"], "second_user_id": y["id"]}, headers=sh
    ).json()
    assert client.post(f"/referrals/{ref['id']}/respond", json={"accept": True}, headers=sh).status_code == 403
    assert client.post(f"/referrals/{ref['id']}/consume", headers=xh).status_code == 403
    assert client.post("/referrals/999999/respond", json={"accept": True}, headers=xh).status_code == 404
    assert client.post("/referrals/999999/consume", headers=sh).status_code == 404

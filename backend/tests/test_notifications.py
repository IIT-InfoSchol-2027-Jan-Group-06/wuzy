from tests.conftest import connect, make_user


def _types(client, headers):
    return [n["type"] for n in client.get("/notifications", headers=headers).json()]


def _of(client, headers, type):
    return [n for n in client.get("/notifications", headers=headers).json() if n["type"] == type]


def test_connect_notifies_scanned_user_once(client):
    a, ah = make_user(client)
    b, bh = make_user(client)
    assert client.post(f"/users/{b['id']}/connect", headers=ah).status_code == 200
    assert client.post(f"/users/{b['id']}/connect", headers=ah).status_code == 200
    rows = client.get("/notifications", headers=bh).json()
    assert [(n["type"], n["actor_id"], n["entity_id"]) for n in rows] == [("connection", a["id"], a["id"])]
    assert rows[0]["payload"]["url"] == f"/profile/{a['id']}"
    assert rows[0]["read_at"] is None
    assert _types(client, ah) == []


def test_referral_rows_follow_the_request(client):
    sender, sh = make_user(client)
    x, xh = make_user(client)
    y, yh = make_user(client)
    connect(client, sender, sh, x, xh)
    connect(client, sender, sh, y, yh)
    ref = client.post(
        "/referrals", json={"first_user_id": x["id"], "second_user_id": y["id"]}, headers=sh
    ).json()

    row = client.get("/notifications", headers=xh).json()[0]
    assert row["type"] == "referral" and row["entity_id"] == ref["id"]
    assert row["payload"]["my_status"] == "pending" and row["payload"]["status"] == "pending"

    client.post(f"/referrals/{ref['id']}/respond", json={"accept": True}, headers=xh)
    assert _types(client, sh) == ["referral_response"]
    row = client.get("/notifications", headers=xh).json()[0]
    assert row["payload"]["my_status"] == "accepted" and row["payload"]["status"] == "pending"

    client.post(f"/referrals/{ref['id']}/respond", json={"accept": True}, headers=yh)
    assert _types(client, sh) == ["referral_response", "referral_response"]
    for headers in (xh, yh):
        # The connect() helper already left one connection row; the referral adds a second.
        assert len(_of(client, headers, "connection")) == 2
        assert _of(client, headers, "referral")[0]["payload"]["status"] == "accepted"


def test_decline_marks_rows(client):
    sender, sh = make_user(client)
    x, xh = make_user(client)
    y, yh = make_user(client)
    connect(client, sender, sh, x, xh)
    connect(client, sender, sh, y, yh)
    ref = client.post(
        "/referrals", json={"first_user_id": x["id"], "second_user_id": y["id"]}, headers=sh
    ).json()
    client.post(f"/referrals/{ref['id']}/respond", json={"accept": False}, headers=xh)
    for headers in (xh, yh):
        assert len(_of(client, headers, "referral_declined")) == 1
        assert _of(client, headers, "referral")[0]["payload"]["status"] == "declined"


def test_group_add_notifies_members(client):
    a, ah = make_user(client)
    b, bh = make_user(client)
    connect(client, a, ah, b, bh)
    group = client.post("/groups", json={"name": "Squad", "member_ids": [b["id"]]}, headers=ah).json()
    rows = client.get("/notifications", headers=bh).json()
    assert rows[0]["type"] == "group" and rows[0]["entity_id"] == group["id"]
    assert rows[0]["payload"]["url"] == f"/chat/{group['id']}?kind=group"
    assert _types(client, ah) == []


def test_mark_all_read(client):
    a, ah = make_user(client)
    b, bh = make_user(client)
    client.post(f"/users/{b['id']}/connect", headers=ah)
    assert client.post("/notifications/read", headers=bh).status_code == 204
    rows = client.get("/notifications", headers=bh).json()
    assert len(rows) == 1 and rows[0]["read_at"] is not None

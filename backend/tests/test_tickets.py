from tests.conftest import make_user


def _dash_quest(client, headers, key):
    dash = client.get("/quests/", headers=headers).json()
    return next(q for q in dash["quests"] if q["key"] == key)


def _event_id(client, seed_headers):
    return client.get("/events/recommended", headers=seed_headers).json()[0]["id"]


def test_purchase_quantity_and_cap(client, user, seed_headers):
    _, headers = user
    event_id = _event_id(client, seed_headers)
    res = client.post("/tickets/purchase", json={"event_id": event_id, "quantity": 5}, headers=headers)
    assert res.status_code == 200, res.text
    assert len(res.json()) == 5 and res.json()[0]["event"]["id"] == event_id
    mine = client.get("/tickets/", headers=headers).json()
    assert len(mine) == 5 and mine[0]["event"]["title"]
    # Tier one wants a single ticket; the surplus in one purchase is not carried over.
    assert _dash_quest(client, headers, "ticket_holder")["tiers"][0]["current_progress"] == 1
    assert client.post("/tickets/purchase", json={"quantity": 11}, headers=headers).status_code == 422
    assert client.post("/tickets/purchase", json={"event_id": 999999}, headers=headers).status_code == 404


def test_share_counts_for_owner_only(client, user):
    _, headers = user
    ticket = client.post("/tickets/purchase", json={}, headers=headers).json()[0]
    _, other = make_user(client)
    assert client.post(f"/tickets/{ticket['id']}/share", headers=other).status_code == 403
    assert client.post(f"/tickets/{ticket['id']}/share", headers=headers).status_code == 204
    assert client.post("/tickets/999999/share", headers=headers).status_code == 404
    assert _dash_quest(client, headers, "ticket_sharing")["claimable"]


def test_gift_needs_a_connection_and_notifies(client, pair, seed_headers):
    (a, ah), (b, bh) = pair
    event_id = _event_id(client, seed_headers)
    stranger, _ = make_user(client)
    assert client.post("/tickets/gift", json={"to_user_id": a["id"], "event_id": event_id}, headers=ah).status_code == 400
    assert client.post("/tickets/gift", json={"to_user_id": stranger["id"], "event_id": event_id}, headers=ah).status_code == 403
    assert client.post("/tickets/gift", json={"to_user_id": b["id"], "event_id": 999999}, headers=ah).status_code == 404

    res = client.post("/tickets/gift", json={"to_user_id": b["id"], "event_id": event_id}, headers=ah)
    assert res.status_code == 200, res.text
    gift = res.json()
    assert gift["user_id"] == b["id"] and gift["gifted_by"] == a["id"]
    assert [t["id"] for t in client.get("/tickets/", headers=bh).json()] == [gift["id"]]
    assert client.get("/tickets/", headers=ah).json() == []
    notes = [n for n in client.get("/notifications", headers=bh).json() if n["type"] == "gift"]
    assert len(notes) == 1 and notes[0]["payload"]["url"] == "/ticket-vault"
    assert _dash_quest(client, ah, "gift_giver")["claimable"]

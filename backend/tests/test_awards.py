from tests.conftest import make_user


def test_badge_deck_is_stable_and_persisted(client, user):
    me, headers = user
    deck = client.get("/awards/deck", headers=headers).json()
    assert sorted(deck) == list(range(1, 16))
    assert client.get("/awards/deck", headers=headers).json() == deck
    assert client.get(f"/awards/user/{me['id']}/deck").json() == deck
    assert client.get("/auth/me", headers=headers).json()["badge_deck"] == deck
    assert client.get("/awards/user/999999/deck").status_code == 404


def test_ticket_purchase_then_claim_grants_award_and_xp(client, user):
    _, headers = user
    deck = client.get("/awards/deck", headers=headers).json()

    res = client.post("/tickets/purchase", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["ticket"]["award_granted"] is False
    assert body["award"] is None
    ticket_id = body["ticket"]["id"]

    # Fewer than five tickets cannot claim the badge yet.
    assert client.post("/tickets/claim-award", headers=headers).status_code == 400

    for _ in range(4):
        assert client.post("/tickets/purchase", headers=headers).status_code == 200
    assert len(client.get("/tickets/", headers=headers).json()) == 5

    award = client.post("/tickets/claim-award", headers=headers)
    assert award.status_code == 200
    award_body = award.json()
    assert award_body["award_type"] == "ticket_purchase"
    assert award_body["reward_xp"] == 50
    assert award_body["badge_id"] in deck

    # Idempotent: claiming again returns the same award, no extra XP.
    again = client.post("/tickets/claim-award", headers=headers)
    assert again.status_code == 200
    assert again.json()["id"] == award_body["id"]

    tickets = client.get("/tickets/", headers=headers).json()
    assert all(t["award_granted"] for t in tickets)
    assert ticket_id in [t["id"] for t in tickets]

    xp = client.get("/users/me/xp", headers=headers).json()
    assert xp["total_xp"] == 50
    assert xp["rank"] and "progress_pct" in xp


def test_complete_profile_award_once(client, user):
    _, headers = user
    res = client.post("/awards/complete-profile", headers=headers)
    assert res.status_code == 200
    assert res.json()["award_type"] == "profile_complete"
    assert client.post("/awards/complete-profile", headers=headers).status_code == 400
    awards = client.get("/awards/", headers=headers).json()
    assert [a["award_type"] for a in awards] == ["profile_complete"]


def test_quest_claim_grants_award(client, user):
    me, headers = user
    quest = client.get("/quests/", headers=headers).json()["quests"][0]
    for _ in range(quest["active_subtask"]["target_count"]):
        client.post(f"/quests/{quest['id']}/progress", headers=headers)
    assert client.post(f"/quests/{quest['id']}/claim", headers=headers).status_code == 200

    awards = client.get(f"/awards/user/{me['id']}").json()
    assert [a["award_type"] for a in awards] == [quest["name"]]
    xp = client.get("/users/me/xp", headers=headers).json()
    assert xp["total_xp"] == quest["active_subtask"]["reward_xp"]


def test_awards_require_auth(client):
    assert client.get("/awards/").status_code == 401
    assert client.post("/tickets/purchase").status_code == 401
    assert client.get("/awards/user/999999").status_code == 404
    _, headers = make_user(client)
    assert client.get("/awards/", headers=headers).json() == []

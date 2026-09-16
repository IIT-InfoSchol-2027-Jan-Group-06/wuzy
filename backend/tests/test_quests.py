from datetime import UTC, datetime, timedelta

from sqlmodel import Session

from app.core.badges import rank_for
from app.db.session import engine
from app.models.user import User
from tests.conftest import connect, make_user

KEYS = [
    "social_network",
    "matchmaker",
    "squad_up",
    "explorer",
    "ticket_holder",
    "ticket_sharing",
    "gift_giver",
    "daily_streak",
    "complete_profile",
]


def _dash(client, headers):
    res = client.get("/quests/", headers=headers)
    assert res.status_code == 200, res.text
    return res.json()


def _quest(dash, key):
    return next(q for q in dash["quests"] if q["key"] == key)


def test_dashboard_shape(client, user):
    _, headers = user
    dash = _dash(client, headers)
    assert [q["key"] for q in dash["quests"]] == KEYS
    assert dash["xp"] == {
        "total_xp": 0,
        "rank": "Bronze",
        "rank_index": 0,
        "next_rank": "Silver",
        "rank_threshold": 0,
        "next_threshold": 250,
    }
    assert sorted(dash["deck"]) == list(range(1, 16))
    assert client.get("/auth/me", headers=headers).json()["badge_deck"] == dash["deck"]
    for q in dash["quests"]:
        assert q["active_tier_index"] == 0 and not q["claimable"] and not q["completed"]
        assert q["badge_id"] == dash["deck"][q["sort_order"]]
        assert q["tiers"] and all(t["current_progress"] == 0 for t in q["tiers"])
    me = client.get("/auth/me", headers=headers).json()
    assert client.get(f"/quests/user/{me['id']}").json()["deck"] == dash["deck"]
    assert client.get("/quests/user/999999").status_code == 404


def test_connect_counts_for_both_and_claim_pays(client, pair):
    (a, ah), (b, bh) = pair
    for headers in (ah, bh):
        q = _quest(_dash(client, headers), "social_network")
        assert q["tiers"][0]["current_progress"] == 1 and q["claimable"]

    dash = client.post("/quests/social_network/claim", headers=ah).json()
    q = _quest(dash, "social_network")
    assert dash["xp"]["total_xp"] == 30
    assert q["active_tier_index"] == 1 and not q["claimable"] and not q["completed"]
    awards = client.get("/awards/", headers=ah).json()
    assert [(x["award_type"], x["tier"], x["badge_id"]) for x in awards] == [("social_network", 1, None)]

    # Claiming again before the next tier is reached fails.
    res = client.post("/quests/social_network/claim", headers=ah)
    assert res.status_code == 400 and res.json()["detail"] == "Tier target not reached"
    assert client.post("/quests/nope/claim", headers=ah).status_code == 404


def test_last_tier_grants_badge(client, pair):
    (a, ah), (b, _) = pair
    assert client.post("/groups", json={"name": "Squad", "member_ids": [b["id"]]}, headers=ah).status_code == 201
    dash = client.post("/quests/squad_up/claim", headers=ah).json()
    q = _quest(dash, "squad_up")
    assert q["completed"] and q["active_tier_index"] is None
    awards = client.get("/awards/", headers=ah).json()
    badge = next(x for x in awards if x["award_type"] == "squad_up")
    assert badge["badge_id"] == dash["deck"][2] and badge["tier"] == 1
    assert client.post("/quests/squad_up/claim", headers=ah).status_code == 400


def _set_last_login(user_id, days_ago):
    with Session(engine) as session:
        u = session.get(User, user_id)
        u.last_login_date = datetime.now(UTC).date() - timedelta(days=days_ago)
        session.add(u)
        session.commit()


def test_daily_streak(client, user):
    me, headers = user
    dash = client.post("/quests/daily-login", headers=headers).json()
    assert _quest(dash, "daily_streak")["tiers"][0]["current_progress"] == 1
    dash = client.post("/quests/daily-login", headers=headers).json()
    assert _quest(dash, "daily_streak")["tiers"][0]["current_progress"] == 1

    client.post("/quests/daily_streak/claim", headers=headers)
    _set_last_login(me["id"], 1)
    dash = client.post("/quests/daily-login", headers=headers).json()
    assert _quest(dash, "daily_streak")["tiers"][1]["current_progress"] == 2

    _set_last_login(me["id"], 3)
    dash = client.post("/quests/daily-login", headers=headers).json()
    assert _quest(dash, "daily_streak")["tiers"][1]["current_progress"] == 1


def test_rank_for():
    assert rank_for(0)["rank"] == "Bronze" and rank_for(0)["next_threshold"] == 250
    assert rank_for(250)["rank"] == "Silver" and rank_for(599)["rank"] == "Silver"
    assert rank_for(600)["rank"] == "Gold"
    diamond = rank_for(1100)
    assert diamond["rank"] == "Diamond" and diamond["next_rank"] is None


def test_matchmaker_counts_accepted_referrals(client):
    sender, sh = make_user(client)
    x, xh = make_user(client)
    y, yh = make_user(client)
    connect(client, sender, sh, x, xh)
    connect(client, sender, sh, y, yh)
    ref = client.post(
        "/referrals", json={"first_user_id": x["id"], "second_user_id": y["id"]}, headers=sh
    ).json()
    client.post(f"/referrals/{ref['id']}/respond", json={"accept": True}, headers=xh)
    assert _quest(_dash(client, sh), "matchmaker")["tiers"][0]["current_progress"] == 0
    client.post(f"/referrals/{ref['id']}/respond", json={"accept": True}, headers=yh)
    assert _quest(_dash(client, sh), "matchmaker")["claimable"]
    # The referred pair became connections, which counts for their Social Network too.
    assert _quest(_dash(client, xh), "social_network")["tiers"][0]["current_progress"] == 1


def test_explorer_counts_first_going_only(client, user, seed_headers):
    _, headers = user
    event_id = client.get("/events/recommended", headers=seed_headers).json()[0]["id"]
    client.post(f"/events/{event_id}/engage", json={"kind": "view"}, headers=headers)
    assert _quest(_dash(client, headers), "explorer")["tiers"][0]["current_progress"] == 0
    client.post(f"/events/{event_id}/engage", json={"kind": "going"}, headers=headers)
    client.post(f"/events/{event_id}/engage", json={"kind": "going"}, headers=headers)
    q = _quest(_dash(client, headers), "explorer")
    assert q["tiers"][0]["current_progress"] == 1 and q["claimable"]


def test_profile_patch_completes_profile(client, user):
    _, headers = user
    res = client.patch("/users/me", json={"bio": "hi"}, headers=headers)
    assert res.status_code == 200 and res.json()["bio"] == "hi"
    assert not _quest(_dash(client, headers), "complete_profile")["claimable"]
    res = client.patch(
        "/users/me",
        json={"display_name": "Me", "hobbies": ["Music"], "avatar_url": "/uploads/avatar/a.png"},
        headers=headers,
    )
    assert res.json()["hobbies"] == ["Music"]
    dash = client.post("/quests/complete_profile/claim", headers=headers).json()
    assert dash["xp"]["total_xp"] == 100
    q = _quest(dash, "complete_profile")
    assert q["completed"] and q["badge_id"] == dash["deck"][8]
    assert client.patch("/users/me", json={"bio": "x"}).status_code == 401

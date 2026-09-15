def test_recommended_and_categories(client, seed_headers):
    res = client.get("/events/recommended", headers=seed_headers)
    assert res.status_code == 200
    events = res.json()
    assert events
    assert all(isinstance(e["score"], float) and e["reason"] for e in events)
    categories = client.get("/events/categories", headers=seed_headers).json()
    assert categories
    assert {c["id"] for c in categories} <= {e["category"] for e in events}


def test_get_and_engage(client, user, seed_headers):
    _, headers = user
    event_id = client.get("/events/recommended", headers=seed_headers).json()[0]["id"]
    assert client.get(f"/events/{event_id}").json()["id"] == event_id
    assert client.get("/events/999999").status_code == 404

    assert client.post(f"/events/{event_id}/engage", json={"kind": "view"}, headers=headers).status_code == 204
    assert client.post(f"/events/{event_id}/engage", json={"kind": "going"}, headers=headers).status_code == 204
    assert client.post(f"/events/{event_id}/engage", json={"kind": "maybe"}, headers=headers).status_code == 422
    assert client.post("/events/999999/engage", json={"kind": "view"}, headers=headers).status_code == 404


def _overlaps(event, hobbies):
    return bool(({t.lower() for t in event["tags"]} | {event["category"]}) & hobbies)


def test_explorer_ranks_by_interest(client, seed_headers):
    """The explore screen: a user with hobbies sees matching events labelled
    "interest", ranked by score, and category pills only for matching events."""
    hobbies = {h.lower() for h in client.get("/auth/me", headers=seed_headers).json()["hobbies"]}
    assert hobbies
    events = client.get("/events/recommended", headers=seed_headers).json()

    scores = [e["score"] for e in events]
    assert scores == sorted(scores, reverse=True)
    assert {e["reason"] for e in events} <= {"interest", "trending", "discover"}
    assert any(e["reason"] == "interest" for e in events)
    for event in events:
        if event["reason"] == "interest":
            assert _overlaps(event, hobbies), event["title"]

    categories = [c["id"] for c in client.get("/events/categories", headers=seed_headers).json()]
    assert categories
    for category in categories:
        assert any(_overlaps(e, hobbies) for e in events if e["category"] == category), category


def test_explorer_without_hobbies_is_pure_discovery(client, user):
    """A fresh user has no hobbies, so nothing is an "interest" match and the
    category bar falls back to every category, biggest first."""
    _, headers = user
    events = client.get("/events/recommended", headers=headers).json()
    assert events
    assert {e["reason"] for e in events} <= {"trending", "discover"}

    categories = [c["id"] for c in client.get("/events/categories", headers=headers).json()]
    assert set(categories) == {e["category"] for e in events}
    counts = [sum(e["category"] == c for e in events) for c in categories]
    assert counts == sorted(counts, reverse=True)

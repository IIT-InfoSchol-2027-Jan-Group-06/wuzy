def test_progress_and_claim(client, user):
    _, headers = user
    res = client.get("/quests/", headers=headers)
    assert res.status_code == 200
    quests = res.json()["quests"]
    assert quests
    quest = quests[0]
    active = quest["active_subtask"]
    assert quest["subtask_step"] == 1
    assert quest["claimed_steps"] == 0
    assert active["current_progress"] == 0

    assert client.post(f"/quests/{quest['id']}/claim", headers=headers).status_code == 400

    for step in range(1, active["target_count"] + 1):
        res = client.post(f"/quests/{quest['id']}/progress", headers=headers)
        assert res.json()["active_subtask"]["current_progress"] == step
    res = client.post(f"/quests/{quest['id']}/progress", headers=headers)
    assert res.json()["active_subtask"]["current_progress"] == active["target_count"]

    res = client.post(f"/quests/{quest['id']}/claim", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["claimed_steps"] == 1
    if body["subtask_total"] > 1:
        assert body["subtask_step"] == 2
    else:
        assert body["active_subtask"] is None


def test_unknown_quest(client, user):
    _, headers = user
    assert client.post("/quests/999999/progress", headers=headers).status_code == 404
    assert client.post("/quests/999999/claim", headers=headers).status_code == 404

from tests.conftest import make_user


def test_create_group_keeps_only_connections(client, pair):
    (a, ah), (b, _) = pair
    stranger, stranger_headers = make_user(client)
    res = client.post(
        "/groups", json={"name": "  Squad ", "member_ids": [b["id"], stranger["id"], a["id"]]},
        headers=ah,
    )
    assert res.status_code == 201
    group = res.json()
    assert group["name"] == "Squad"
    assert group["created_by"] == a["id"]
    assert {m["id"] for m in group["members"]} == {a["id"], b["id"]}

    assert [g["id"] for g in client.get("/groups", headers=ah).json()] == [group["id"]]
    assert client.get(f"/groups/{group['id']}", headers=ah).json()["id"] == group["id"]
    assert client.get(f"/groups/{group['id']}", headers=stranger_headers).status_code == 403
    assert client.get("/groups", headers=stranger_headers).json() == []


def test_blank_name(client, user):
    _, headers = user
    assert client.post("/groups", json={"name": "   "}, headers=headers).status_code == 422

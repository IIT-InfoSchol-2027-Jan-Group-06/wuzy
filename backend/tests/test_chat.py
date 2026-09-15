from tests.conftest import make_user


def test_people_and_conversations(client, pair):
    (a, ah), (b, bh) = pair
    people = client.get("/chat/people", headers=ah).json()
    assert [p["user"]["id"] for p in people] == [b["id"]]
    assert people[0]["conversation_id"] is None
    assert client.get("/chat/conversations", headers=ah).json() == []

    thread = client.get(f"/ws/conversations/{a['id']}/{b['id']}").json()["conversation_id"]
    assert client.get(f"/ws/conversations/{b['id']}/{a['id']}").json()["conversation_id"] == thread

    assert client.get("/chat/people", headers=ah).json()[0]["conversation_id"] == thread
    conversations = client.get("/chat/conversations", headers=bh).json()
    assert [c["id"] for c in conversations] == [thread]
    assert conversations[0]["other"]["id"] == a["id"]
    assert client.get(f"/chat/conversations/{thread}/peer", headers=ah).json()["id"] == b["id"]


def test_peer_requires_membership(client, pair):
    (a, _), (b, _) = pair
    thread = client.get(f"/ws/conversations/{a['id']}/{b['id']}").json()["conversation_id"]
    _, stranger = make_user(client)
    assert client.get(f"/chat/conversations/{thread}/peer", headers=stranger).status_code == 404

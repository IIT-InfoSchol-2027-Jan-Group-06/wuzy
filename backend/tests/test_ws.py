import pytest
from starlette.websockets import WebSocketDisconnect

from tests.conftest import make_user


def test_conversation_requires_connection(client, pair):
    (a, _), (b, _) = pair
    stranger, _ = make_user(client)
    assert client.get(f"/ws/conversations/{a['id']}/{b['id']}").status_code == 200
    assert client.get(f"/ws/conversations/{a['id']}/{stranger['id']}").status_code == 403


def test_group_helpers(client):
    assert client.get("/ws/groups/999999/exists").json() == {"exists": False}
    assert client.get("/ws/groups/999999/members").json() == {"members": []}


def test_socket_rejects_bad_token(client, user):
    me, _ = user
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"/ws/{me['id']}?token=bad"):
            pass
    assert exc.value.code == 4401


def test_socket_rejects_other_users_token(client, pair):
    (a, ah), (b, _) = pair
    token = ah["Authorization"].split()[1]
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"/ws/{b['id']}?token={token}"):
            pass
    assert exc.value.code == 4401

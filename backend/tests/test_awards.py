from tests.conftest import make_user


def test_awards_require_auth(client):
    assert client.get("/awards/").status_code == 401
    assert client.post("/tickets/purchase").status_code == 401
    assert client.get("/awards/user/999999").status_code == 404
    _, headers = make_user(client)
    assert client.get("/awards/", headers=headers).json() == []

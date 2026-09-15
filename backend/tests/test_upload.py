def test_upload_and_serve(client, user):
    _, headers = user
    files = {"file": ("my pic.png", b"\x89PNG fake", "image/png")}
    res = client.post("/upload/post", files=files, headers=headers)
    assert res.status_code == 200
    url = res.json()["url"]
    assert url.startswith("/uploads/post/my_pic-")
    served = client.get(url)
    assert served.status_code == 200
    assert served.content == b"\x89PNG fake"


def test_upload_errors(client, user):
    _, headers = user
    files = {"file": ("a.exe", b"x", "application/octet-stream")}
    assert client.post("/upload/post", files=files, headers=headers).status_code == 400
    files = {"file": ("a.png", b"x", "image/png")}
    assert client.post("/upload/other", files=files, headers=headers).status_code == 404
    assert client.post("/upload/post", files=files).status_code == 401

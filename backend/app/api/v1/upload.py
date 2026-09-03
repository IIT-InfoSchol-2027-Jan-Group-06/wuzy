"""Upload endpoint for user media.

POST /upload/<kind>  - Upload a file (kind in: post, avatar), returns the URL
"""

import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.core.auth import get_current_user_id

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "heic"}
STORAGE_ROOT = Path("storage")
SAFE_NAME = re.compile(r"[^a-zA-Z0-9_.-]")


def _extension(filename: str) -> str:
    """Return the file extension, lowercased, without the dot."""
    parts = filename.rsplit(".", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="File must have an extension")
    ext = parts[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    return ext


@router.post("/{kind}")
def upload_file(
    kind: str,
    file: UploadFile,
    current_user_id: int = Depends(get_current_user_id),
):
    """Store an uploaded file on the server and return its public URL."""
    if kind not in ("post", "avatar"):
        raise HTTPException(status_code=404, detail="Unknown upload kind")

    filename = file.filename or "file.jpg"
    ext = _extension(filename)
    stem = SAFE_NAME.sub("_", filename.rsplit(".", 1)[0]) or "file"
    unique = f"{stem}-{uuid.uuid4().hex[:8]}.{ext}"

    local_dir = STORAGE_ROOT / kind
    local_dir.mkdir(parents=True, exist_ok=True)
    with open(local_dir / unique, "wb") as out:
        for chunk in file.file:
            out.write(chunk)

    return {"url": f"/uploads/{kind}/{unique}", "kind": kind}

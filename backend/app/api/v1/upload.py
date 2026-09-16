"""Upload endpoint for user media.

POST /upload/<kind>  - Upload a file (kind in: post, avatar, audio), returns the URL

Image uploads are transcoded to webp so the app never serves heavyweight jpg or
png payloads. Files end up in storage/<kind>/ under a sanitized, unique name to
avoid collisions and path traversal. The returned URL is a server-relative path
(e.g. /uploads/post/photo-abc123.webp) that the frontend resolves via assetUrl()
to a full HTTP URL.
"""

import io
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from PIL import Image

from app.core.auth import get_current_user_id

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "heic", "m4a", "mp3", "webm"}
IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "heic"}
STORAGE_ROOT = Path("storage")
# Strip anything that is not alphanumeric, dot, underscore, or hyphen.
SAFE_NAME = re.compile(r"[^a-zA-Z0-9_.-]")


def _extension(filename: str) -> str:
    """Return the file extension, lowercased, without the dot.

    Rejects files with no extension or with an unsupported type so bad
    uploads fail early before hitting disk.
    """
    parts = filename.rsplit(".", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="File must have an extension")
    ext = parts[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    return ext


def _to_webp(data: bytes) -> bytes | None:
    """Transcode image bytes to webp; None when Pillow cannot read the format."""
    try:
        image = Image.open(io.BytesIO(data))
        image.load()
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.mode else "RGB")
        out = io.BytesIO()
        image.save(out, format="WEBP", quality=80)
        return out.getvalue()
    except Exception:
        return None


@router.post("/{kind}")
def upload_file(
    kind: str,
    file: UploadFile,
    current_user_id: int = Depends(get_current_user_id),
):
    """Store an uploaded file on the server and return its public URL.

    Image uploads are transcoded to webp; any format Pillow cannot read (for
    example heic) falls back to the original bytes and extension. Audio is
    streamed to disk untouched. The filename is sanitized and a UUID suffix is
    appended so two users uploading "photo.jpg" do not overwrite each other.
    """
    if kind not in ("post", "avatar", "audio"):
        raise HTTPException(status_code=404, detail="Unknown upload kind")

    filename = file.filename or "file.jpg"
    ext = _extension(filename)
    stem = SAFE_NAME.sub("_", filename.rsplit(".", 1)[0]) or "file"
    unique = f"{stem}-{uuid.uuid4().hex[:8]}"

    local_dir = STORAGE_ROOT / kind
    local_dir.mkdir(parents=True, exist_ok=True)

    if kind == "audio" or ext not in IMAGE_EXTENSIONS:
        target = local_dir / f"{unique}.{ext}"
        with open(target, "wb") as out:
            for chunk in file.file:
                out.write(chunk)
    else:
        data = file.file.read()
        webp = _to_webp(data)
        if webp is not None:
            target = local_dir / f"{unique}.webp"
            target.write_bytes(webp)
        else:
            target = local_dir / f"{unique}.{ext}"
            target.write_bytes(data)

    return {"url": f"/uploads/{kind}/{target.name}", "kind": kind}

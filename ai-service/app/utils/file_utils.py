from pathlib import Path
import tempfile
import os

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp"
}

def validate_mime(content_type: str) -> bool:
    return content_type in ALLOWED_MIME_TYPES or content_type.startswith("image/")

def save_temp_file(contents: bytes, suffix: str = "") -> Path:
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(contents)
    return Path(path)

def cleanup(path: Path | None) -> None:
    if path and path.exists():
        try:
            path.unlink()
        except OSError:
            pass

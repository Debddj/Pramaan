import os
import hashlib
import base64
from typing import Optional
from dataclasses import dataclass
from app.core.config import settings


@dataclass
class StorageRecord:
    sha256_hash: str
    path: str
    size_bytes: int
    base64_data: Optional[str] = None
    data_uri: Optional[str] = None


class ObjectStore:
    """
    Content-addressable object storage for evidence images.
    Supports 'local' filesystem (zero-infra dev) and is extensible to MinIO/GCS.
    """

    def __init__(self):
        self.backend = settings.STORAGE_BACKEND

    def store(self, image_bytes: bytes, ext: str = "jpg") -> StorageRecord:
        sha256 = hashlib.sha256(image_bytes).hexdigest()
        size = len(image_bytes)
        b64_str = base64.b64encode(image_bytes).decode("utf-8")
        mime = "jpeg" if ext.lower() in ["jpg", "jpeg"] else ext.lower()
        data_uri = f"data:image/{mime};base64,{b64_str}"

        if self.backend == "local":
            rec = self._store_local(image_bytes, sha256, ext, size)
            rec.base64_data = b64_str
            rec.data_uri = data_uri
            return rec
        else:
            # Future: MinIO / GCS
            rec = self._store_local(image_bytes, sha256, ext, size)
            rec.base64_data = b64_str
            rec.data_uri = data_uri
            return rec

    def _store_local(self, data: bytes, sha256: str, ext: str, size: int) -> StorageRecord:
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{sha256}.{ext}"
        filepath = os.path.join(upload_dir, filename)
        try:
            with open(filepath, "wb") as f:
                f.write(data)
        except Exception:
            pass
        return StorageRecord(sha256_hash=sha256, path=filepath, size_bytes=size)

    def retrieve(self, sha256_hash: str, ext: str = "jpg") -> Optional[bytes]:
        filepath = os.path.join(settings.UPLOAD_DIR, f"{sha256_hash}.{ext}")
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                return f.read()
        return None


object_store = ObjectStore()

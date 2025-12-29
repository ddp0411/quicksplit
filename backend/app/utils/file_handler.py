# File handler utilities
import os
from typing import Optional
from app.core.config import settings


def save_uploaded_file(file_content: bytes, filename: str) -> str:
    """Save uploaded file to disk."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    return file_path


def delete_file(file_path: str) -> bool:
    """Delete a file from disk."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False


def get_file_size(file_path: str) -> Optional[int]:
    """Get file size in bytes."""
    try:
        return os.path.getsize(file_path)
    except Exception:
        return None


# Hashing utilities
import hashlib


def hash_file(file_content: bytes) -> str:
    """Generate SHA256 hash of file content."""
    return hashlib.sha256(file_content).hexdigest()


def hash_string(text: str) -> str:
    """Generate SHA256 hash of string."""
    return hashlib.sha256(text.encode()).hexdigest()


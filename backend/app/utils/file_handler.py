from pathlib import Path
from typing import Optional
import hashlib
import aiofiles
from app.core.config import settings


class FileHandler:
    """Utility class for file operations"""
    
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.heic'}
    MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE
    
    @classmethod
    def is_valid_image(cls, filename: Optional[str]) -> bool:
        """Check if file has valid image extension"""
        if not filename:
            return False
        return Path(filename).suffix.lower() in cls.ALLOWED_EXTENSIONS
    
    @classmethod
    def validate_file_size(cls, content: bytes) -> bool:
        """Validate file size"""
        return len(content) <= cls.MAX_FILE_SIZE
    
    @classmethod
    async def save_upload(cls, content: bytes, filename: str) -> str:
        """
        Save uploaded file
        Returns: Saved file path
        """
        # Create upload directory
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_hash = hashlib.md5(content).hexdigest()
        extension = Path(filename).suffix
        new_filename = f"{file_hash}{extension}"
        
        file_path = upload_dir / new_filename
        
        # Save file asynchronously
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        return str(file_path)
    
    @staticmethod
    def calculate_hash(content: bytes) -> str:
        """Calculate SHA-256 hash of file content"""
        return hashlib.sha256(content).hexdigest()

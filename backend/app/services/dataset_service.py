from pathlib import Path
from typing import Optional
import json
from datetime import datetime
from app.core.config import settings


class DatasetService:
    """
    Service for managing AI training dataset
    Organizes receipts, OCR results, and annotations
    """
    
    def __init__(self):
        self.dataset_dir = Path(settings.DATASET_DIR)
        self.raw_dir = self.dataset_dir / 'raw' / 'images'
        self.processed_dir = self.dataset_dir / 'processed'
        self.annotations_dir = self.dataset_dir / 'annotations'
        
        # Create directories
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        self.annotations_dir.mkdir(parents=True, exist_ok=True)
    
    async def save_dataset_image(self, content: bytes, image_hash: str) -> str:
        """
        Save image to dataset directory
        Organizes by date for easy management
        """
        # Create date-based subdirectory
        date_dir = self.raw_dir / datetime.now().strftime('%Y-%m-%d')
        date_dir.mkdir(exist_ok=True)
        
        # Save image
        image_path = date_dir / f"{image_hash}.png"
        with open(image_path, 'wb') as f:
            f.write(content)
        
        return str(image_path)
    
    def save_annotation(
        self,
        image_hash: str,
        ocr_text: str,
        detected_total: Optional[float],
        actual_total: float,
        metadata: dict
    ) -> str:
        """
        Save annotation data for training
        """
        annotation = {
            'image_hash': image_hash,
            'ocr_text': ocr_text,
            'detected_total': detected_total,
            'actual_total': actual_total,
            'metadata': metadata,
            'created_at': datetime.now().isoformat()
        }
        
        annotation_path = self.annotations_dir / f"{image_hash}.json"
        with open(annotation_path, 'w') as f:
            json.dump(annotation, f, indent=2)
        
        return str(annotation_path)
    
    def export_coco_format(self) -> dict:
        """
        Export dataset in COCO format for model training
        """
        # Implementation for COCO format export
        # Used for training object detection/OCR models
        return {
            'info': {},
            'licenses': [],
            'images': [],
            'annotations': [],
            'categories': []
        }

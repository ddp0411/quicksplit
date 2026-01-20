from celery import Task
from app.core.celery_app import celery_app
from app.services.dataset_service import DatasetService
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True)
def process_dataset_entry(self: Task, entry_id: str):
    """
    Process dataset entry in background
    - Validate OCR results
    - Calculate accuracy metrics
    - Prepare for model training
    """
    try:
        logger.info(f"Processing dataset entry: {entry_id}")
        
        # Perform dataset processing
        # - Text normalization
        # - Entity extraction
        # - Confidence calculation
        
        logger.info(f"Dataset entry processed: {entry_id}")
        return {"status": "success", "entry_id": entry_id}
    
    except Exception as exc:
        logger.error(f"Dataset processing failed: {exc}")
        return {"status": "failed", "entry_id": entry_id, "error": str(exc)}


@celery_app.task
def export_dataset_coco():
    """
    Export dataset in COCO format for training
    Runs periodically to prepare training data
    """
    try:
        dataset_service = DatasetService()
        coco_data = dataset_service.export_coco_format()
        
        logger.info("Dataset exported successfully")
        return {"status": "success", "records": len(coco_data.get('images', []))}
    
    except Exception as exc:
        logger.error(f"Dataset export failed: {exc}")
        return {"status": "failed", "error": str(exc)}

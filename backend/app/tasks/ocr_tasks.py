# OCR tasks
from app.core.celery_app import celery_app
from app.services.ocr_service import process_receipt_image
import base64
import asyncio


@celery_app.task(name="process_ocr")
def process_ocr_task(filename: str, file_content: bytes):
    """Process OCR task asynchronously."""
    try:
        # Convert file to base64
        image_data = base64.b64encode(file_content).decode()
        
        # Process image (run async function in sync context)
        result = asyncio.run(process_receipt_image(image_data))
        
        return {
            "status": "completed",
            "result": result,
        }
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e),
        }


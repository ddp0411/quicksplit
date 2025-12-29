# OCR routes
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ocr_service import process_receipt_image
from app.tasks.ocr_tasks import process_ocr_task

router = APIRouter()


@router.post("/upload")
async def upload_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a receipt image for OCR processing."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save file and trigger OCR task
    task = process_ocr_task.delay(file.filename, await file.read())
    
    return {"task_id": task.id, "status": "processing"}


@router.post("/scan")
async def scan_receipt(
    image_data: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Scan receipt from base64 image data."""
    result = await process_receipt_image(image_data)
    return result


@router.get("/result/{task_id}")
async def get_ocr_result(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get OCR processing result."""
    from app.core.celery_app import celery_app
    task_result = celery_app.AsyncResult(task_id)
    
    if task_result.ready():
        return {"status": "completed", "result": task_result.result}
    else:
        return {"status": "processing", "progress": task_result.info}


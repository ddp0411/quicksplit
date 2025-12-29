# Dataset routes
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.dataset_service import upload_dataset_file
from app.tasks.dataset_tasks import process_dataset_task

router = APIRouter()


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a dataset file for training."""
    if not file.filename.endswith((".zip", ".tar", ".tar.gz")):
        raise HTTPException(
            status_code=400,
            detail="File must be a zip or tar archive",
        )
    
    # Save file and trigger processing task
    task = process_dataset_task.delay(file.filename, await file.read())
    
    return {"task_id": task.id, "status": "processing"}


@router.get("/status/{dataset_id}")
async def get_dataset_status(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get dataset processing status."""
    from app.core.celery_app import celery_app
    task_result = celery_app.AsyncResult(dataset_id)
    
    if task_result.ready():
        return {"status": "completed", "result": task_result.result}
    else:
        return {"status": "processing", "progress": task_result.info}


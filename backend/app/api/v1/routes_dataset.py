from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import json
from pathlib import Path

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.dataset import DatasetEntry
from app.schemas.dataset import DatasetResponse, DatasetStats
from app.services.dataset_service import DatasetService
from app.api.deps import get_current_user
from app.utils.file_handler import FileHandler
from app.tasks.dataset_tasks import process_dataset_entry

router = APIRouter(prefix="/dataset", tags=["Dataset"])


@router.post("/submit", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def submit_to_dataset(
    file: UploadFile = File(...),
    ocr_text: str = Form(...),
    actual_total: float = Form(...),
    metadata: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit receipt to training dataset
    - Stores image and OCR results
    - Queues for background processing
    - Used for AI model training
    """
    # Validate file
    if not FileHandler.is_valid_image(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type"
        )
    
    # Read and validate content
    content = await file.read()
    if not FileHandler.validate_file_size(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large"
        )
    
    # Calculate image hash for deduplication
    image_hash = FileHandler.calculate_hash(content)
    
    # Check if already exists
    existing = await db.execute(
        select(DatasetEntry).where(DatasetEntry.image_hash == image_hash)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This receipt has already been submitted"
        )
    
    # Save to dataset directory
    dataset_service = DatasetService()
    image_path = await dataset_service.save_dataset_image(content, image_hash)
    
    # Parse metadata
    try:
        metadata_dict = json.loads(metadata) if metadata else {}
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid metadata JSON: {exc.msg}"
        ) from exc
    
    # Create dataset entry
    entry = DatasetEntry(
        user_id=current_user.id,
        image_path=image_path,
        image_hash=image_hash,
        ocr_text=ocr_text,
        actual_total=actual_total,
        meta=metadata_dict
    )
    
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    
    # Queue background processing when workers are available.
    try:
        process_dataset_entry.delay(str(entry.id))
    except Exception:
        pass
    
    return DatasetResponse.model_validate(entry)


@router.get("/stats", response_model=DatasetStats)
async def get_dataset_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dataset statistics"""
    # Total entries
    total_result = await db.execute(select(func.count(DatasetEntry.id)))
    total = total_result.scalar()
    
    # Verified entries
    verified_result = await db.execute(
        select(func.count(DatasetEntry.id)).where(DatasetEntry.is_verified == 1)
    )
    verified = verified_result.scalar()
    
    # Unverified entries
    unverified_result = await db.execute(
        select(func.count(DatasetEntry.id)).where(DatasetEntry.is_verified == 0)
    )
    unverified = unverified_result.scalar()
    
    # Rejected entries
    rejected_result = await db.execute(
        select(func.count(DatasetEntry.id)).where(DatasetEntry.is_verified == -1)
    )
    rejected = rejected_result.scalar()
    
    # Average confidence
    avg_confidence_result = await db.execute(
        select(func.avg(DatasetEntry.confidence)).where(DatasetEntry.confidence.isnot(None))
    )
    avg_confidence = avg_confidence_result.scalar() or 0.0
    
    total_size_bytes = 0
    for image_path in (Path(settings.DATASET_DIR) / "raw" / "images").rglob("*"):
        if image_path.is_file():
            total_size_bytes += image_path.stat().st_size

    return DatasetStats(
        total_entries=total,
        verified_entries=verified,
        unverified_entries=unverified,
        rejected_entries=rejected,
        average_confidence=float(avg_confidence),
        total_images_size_mb=round(total_size_bytes / (1024 * 1024), 2)
    )

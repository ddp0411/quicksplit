from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import time
import hashlib

from app.core.database import get_db
from app.models.user import User
from app.schemas.dataset import OCRResult, OCRValidation
from app.services.ocr_service import OCRService
from app.api.deps import get_current_user
from app.utils.file_handler import FileHandler
from app.services.cache_service import cache_service
from app.tasks.ocr_tasks import process_ocr_background

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/upload", response_model=OCRResult)
async def upload_and_process_ocr(
    file: UploadFile = File(...),
    preprocessed: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload image and process with OCR
    - Validates file type and size
    - Saves image temporarily
    - Returns OCR results with detected total
    """
    start_time = time.time()
    
    # Validate file
    if not FileHandler.is_valid_image(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed."
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if not FileHandler.validate_file_size(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )
    
    try:
        image_hash = FileHandler.calculate_hash(content)
        cache_key = f"ocr:upload:{image_hash}"
        cached_result = await cache_service.get_json(cache_key)
        if cached_result:
            return OCRResult(**cached_result)

        # Save file
        file_path = await FileHandler.save_upload(content, file.filename)
        
        # Process OCR (backend validation/enhancement)
        # Frontend already did OCR, this is for validation
        ocr_service = OCRService()
        result = await ocr_service.process_image(file_path, preprocessed)
        
        processing_time = time.time() - start_time

        response = OCRResult(
            text=result["text"],
            confidence=result["confidence"],
            detected_total=result["detected_total"],
            processing_time=processing_time
        )
        await cache_service.set_json(cache_key, response.model_dump(), ttl_seconds=60 * 60 * 24)

        try:
            process_ocr_background.delay(file_path, str(current_user.id))
        except Exception:
            # OCR upload should remain usable even when the worker is offline locally.
            pass

        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )


@router.post("/validate")
async def validate_ocr_result(
    validation: OCRValidation,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Validate OCR results from frontend
    - Cross-checks detected total
    - Stores in cache for dataset collection
    """
    ocr_service = OCRService()
    text_hash = hashlib.sha256(validation.text.encode("utf-8")).hexdigest()
    cache_key = f"ocr:validate:{validation.image_hash}:{text_hash}:{validation.detected_total}"
    cached_result = await cache_service.get_json(cache_key)
    if cached_result:
        return cached_result

    validated = await ocr_service.validate_ocr_text(
        validation.text,
        validation.detected_total
    )

    response = {
        "is_valid": validated["is_valid"],
        "confidence": validated["confidence"],
        "suggested_total": validated["suggested_total"],
        "strategy": validated["strategy"],
        "message": validated["message"]
    }
    await cache_service.set_json(cache_key, response, ttl_seconds=60 * 60 * 6)
    return response

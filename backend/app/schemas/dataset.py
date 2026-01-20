from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class DatasetSubmit(BaseModel):
    ocr_text: str = Field(..., min_length=1)
    actual_total: float = Field(..., gt=0)
    metadata: dict = Field(default_factory=dict)


class DatasetResponse(BaseModel):
    id: UUID
    image_hash: str
    ocr_text: str
    detected_total: Optional[float]
    actual_total: float
    confidence: Optional[float]
    is_verified: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DatasetStats(BaseModel):
    total_entries: int
    verified_entries: int
    unverified_entries: int
    rejected_entries: int
    average_confidence: float
    total_images_size_mb: float


class OCRResult(BaseModel):
    text: str
    confidence: float
    detected_total: Optional[float]
    processing_time: float


class OCRValidation(BaseModel):
    text: str
    detected_total: Optional[float]
    image_hash: str

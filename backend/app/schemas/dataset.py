# Dataset schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class DatasetBase(BaseModel):
    name: str


class DatasetCreate(DatasetBase):
    file_path: str


class DatasetResponse(DatasetBase):
    id: UUID
    user_id: UUID
    file_path: str
    status: str
    total_images: int
    processed_images: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


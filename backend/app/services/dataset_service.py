# Dataset service
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate


async def create_dataset(
    db: AsyncSession,
    dataset_data: DatasetCreate,
    user_id: UUID,
) -> Dataset:
    """Create a new dataset record."""
    dataset = Dataset(
        user_id=user_id,
        name=dataset_data.name,
        file_path=dataset_data.file_path,
    )
    db.add(dataset)
    await db.commit()
    await db.refresh(dataset)
    return dataset


async def get_dataset_by_id(
    db: AsyncSession,
    dataset_id: str,
) -> Optional[Dataset]:
    """Get dataset by ID."""
    from sqlalchemy import select
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    return result.scalar_one_or_none()


async def update_dataset_status(
    db: AsyncSession,
    dataset_id: str,
    status: str,
    processed_images: int = 0,
    total_images: int = 0,
) -> Optional[Dataset]:
    """Update dataset processing status."""
    dataset = await get_dataset_by_id(db, dataset_id)
    if not dataset:
        return None
    
    dataset.status = status
    dataset.processed_images = processed_images
    dataset.total_images = total_images
    await db.commit()
    await db.refresh(dataset)
    return dataset


async def upload_dataset_file(file_path: str, file_content: bytes) -> str:
    """Save uploaded dataset file."""
    import os
    from app.core.config import settings
    
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    
    full_path = os.path.join(upload_dir, file_path)
    with open(full_path, "wb") as f:
        f.write(file_content)
    
    return full_path


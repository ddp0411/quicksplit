# Split service
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from app.models.split import Split
from app.schemas.split import SplitCreate, SplitUpdate


async def create_split(
    db: AsyncSession,
    split_data: SplitCreate,
    user_id: UUID,
) -> Split:
    """Create a new split."""
    split = Split(
        user_id=user_id,
        title=split_data.title,
        total_amount=split_data.total_amount,
        participants=[p.dict() for p in split_data.participants],
        items=[i.dict() for i in split_data.items],
    )
    db.add(split)
    await db.commit()
    await db.refresh(split)
    return split


async def get_split_by_id(db: AsyncSession, split_id: str) -> Optional[Split]:
    """Get split by ID."""
    result = await db.execute(select(Split).where(Split.id == split_id))
    return result.scalar_one_or_none()


async def get_user_splits(db: AsyncSession, user_id: UUID) -> List[Split]:
    """Get all splits for a user."""
    result = await db.execute(select(Split).where(Split.user_id == user_id))
    return list(result.scalars().all())


async def update_split(
    db: AsyncSession,
    split_id: str,
    split_data: SplitUpdate,
    user_id: UUID,
) -> Optional[Split]:
    """Update a split."""
    split = await get_split_by_id(db, split_id)
    if not split or split.user_id != user_id:
        return None
    
    update_data = split_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field in ["participants", "items"]:
            setattr(split, field, [p.dict() if hasattr(p, "dict") else p for p in value])
        else:
            setattr(split, field, value)
    
    await db.commit()
    await db.refresh(split)
    return split


async def delete_split(
    db: AsyncSession,
    split_id: str,
    user_id: UUID,
) -> bool:
    """Delete a split."""
    split = await get_split_by_id(db, split_id)
    if not split or split.user_id != user_id:
        return False
    
    await db.delete(split)
    await db.commit()
    return True


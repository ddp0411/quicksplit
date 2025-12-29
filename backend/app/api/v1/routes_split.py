# Split routes
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.split import SplitCreate, SplitResponse, SplitUpdate
from app.services.split_service import (
    create_split,
    get_split_by_id,
    get_user_splits,
    update_split,
    delete_split,
)

router = APIRouter()


@router.post("/create", response_model=SplitResponse)
async def create_split_bill(
    split_data: SplitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new split bill."""
    split = await create_split(db, split_data, current_user.id)
    return split


@router.get("/{split_id}", response_model=SplitResponse)
async def get_split(
    split_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a split bill by ID."""
    split = await get_split_by_id(db, split_id)
    if not split:
        raise HTTPException(status_code=404, detail="Split not found")
    return split


@router.get("/all", response_model=List[SplitResponse])
async def get_all_splits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all splits for current user."""
    splits = await get_user_splits(db, current_user.id)
    return splits


@router.put("/{split_id}", response_model=SplitResponse)
async def update_split_bill(
    split_id: str,
    split_data: SplitUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a split bill."""
    split = await update_split(db, split_id, split_data, current_user.id)
    if not split:
        raise HTTPException(status_code=404, detail="Split not found")
    return split


@router.delete("/{split_id}")
async def delete_split_bill(
    split_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a split bill."""
    success = await delete_split(db, split_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Split not found")
    return {"message": "Split deleted successfully"}


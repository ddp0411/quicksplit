from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.split import Split, Participant, PaymentStatus
from app.schemas.split import (
    SplitCreate, 
    SplitResponse, 
    SplitListItem,
    ParticipantResponse,
    MarkPaidRequest
)
from app.services.split_service import SplitService
from app.services.upi_service import UPIService
from app.services.qr_service import QRService
from app.services.cache_service import cache_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/splits", tags=["Splits"])


@router.post("/create", response_model=SplitResponse, status_code=status.HTTP_201_CREATED)
async def create_split(
    split_data: SplitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new bill split
    - Calculates split amounts
    - Generates UPI links and QR codes
    - Stores in database
    """
    # Create split record
    new_split = Split(
        user_id=current_user.id,
        total_amount=split_data.total_amount,
        split_type=split_data.split_type,
        meta=split_data.metadata
    )
    
    db.add(new_split)
    await db.flush()
    
    # Calculate split amounts
    split_service = SplitService()
    split_cache_key = f"split:equal:{split_data.total_amount:.2f}:{len(split_data.participants)}"
    cached_amounts = await cache_service.get_json(split_cache_key)
    if cached_amounts:
        amounts = [float(amount) for amount in cached_amounts]
    else:
        amounts = split_service.calculate_equal_split(
            split_data.total_amount,
            len(split_data.participants)
        )
        await cache_service.set_json(split_cache_key, amounts, ttl_seconds=60 * 60)
    
    # Create participants with payment details
    upi_service = UPIService()
    qr_service = QRService()
    
    participants = []
    
    for idx, participant_data in enumerate(split_data.participants):
        amount = amounts[idx]
        
        # Generate UPI link
        upi_link = upi_service.generate_upi_link(
            upi_id=participant_data.upi_id or "merchant@upi",
            name=participant_data.name,
            amount=amount,
            note=f"QuickSplit - {current_user.name}"
        )
        
        # Generate QR code
        qr_code = qr_service.generate_qr_base64(upi_link)
        
        # Create participant record
        participant = Participant(
            split_id=new_split.id,
            name=participant_data.name,
            upi_id=participant_data.upi_id,
            amount=amount
        )
        
        db.add(participant)
        participants.append((participant, upi_link, qr_code))

    await db.flush()

    participant_responses = []
    for participant, upi_link, qr_code in participants:
        payment_status = (
            participant.payment_status.value
            if hasattr(participant.payment_status, "value")
            else participant.payment_status
        )
        
        participant_responses.append(
            ParticipantResponse(
                id=participant.id,
                name=participant.name,
                upi_id=participant.upi_id,
                amount=participant.amount,
                upi_link=upi_link,
                qr_code=qr_code,
                payment_status=payment_status
            )
        )
    
    await db.commit()
    await db.refresh(new_split)
    
    return SplitResponse(
        split_id=new_split.id,
        total_amount=new_split.total_amount,
        split_type=new_split.split_type.value if hasattr(new_split.split_type, "value") else new_split.split_type,
        participants=participant_responses,
        created_at=new_split.created_at
    )


@router.get("/history", response_model=List[SplitListItem])
async def get_user_splits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get user's split history"""
    result = await db.execute(
        select(
            Split.id,
            Split.total_amount,
            Split.created_at,
            func.count(Participant.id).label('participant_count')
        )
        .join(Participant, Split.id == Participant.split_id)
        .where(Split.user_id == current_user.id)
        .group_by(Split.id)
        .order_by(Split.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    splits = result.all()

    return [
        SplitListItem(
            split_id=s.id,
            total_amount=s.total_amount,
            participant_count=s.participant_count,
            created_at=s.created_at
        )
        for s in splits
    ]


@router.get("/{split_id}", response_model=SplitResponse)
async def get_split(
    split_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get split details by ID"""
    result = await db.execute(
        select(Split).where(
            Split.id == split_id,
            Split.user_id == current_user.id
        )
    )
    split = result.scalar_one_or_none()

    if not split:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Split not found"
        )

    # Get participants
    participants_result = await db.execute(
        select(Participant).where(Participant.split_id == split_id)
    )
    participants = participants_result.scalars().all()
    
    # Generate UPI links and QR codes
    upi_service = UPIService()
    qr_service = QRService()
    
    participant_responses = []
    for p in participants:
        upi_link = upi_service.generate_upi_link(
            upi_id=p.upi_id or "merchant@upi",
            name=p.name,
            amount=p.amount
        )
        qr_code = qr_service.generate_qr_base64(upi_link)
        
        participant_responses.append(
            ParticipantResponse(
                id=p.id,
                name=p.name,
                upi_id=p.upi_id,
                amount=p.amount,
                upi_link=upi_link,
                qr_code=qr_code,
                payment_status=p.payment_status.value if hasattr(p.payment_status, "value") else p.payment_status
            )
        )
    
    return SplitResponse(
        split_id=split.id,
        total_amount=split.total_amount,
        split_type=split.split_type.value if hasattr(split.split_type, "value") else split.split_type,
        participants=participant_responses,
        created_at=split.created_at
    )


@router.post("/{split_id}/participants/{participant_id}/paid")
async def mark_as_paid(
    split_id: UUID,
    participant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark participant payment as completed"""
    # Verify split belongs to user
    split_result = await db.execute(
        select(Split).where(
            Split.id == split_id,
            Split.user_id == current_user.id
        )
    )
    split = split_result.scalar_one_or_none()
    
    if not split:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Split not found"
        )
    
    # Update participant status
    participant_result = await db.execute(
        select(Participant).where(
            Participant.id == participant_id,
            Participant.split_id == split_id
        )
    )
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    participant.payment_status = PaymentStatus.PAID
    await db.commit()
    
    return {"message": "Payment marked as completed"}

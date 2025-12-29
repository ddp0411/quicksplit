# Split schemas
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class Participant(BaseModel):
    id: str
    name: str
    amount: Decimal


class Item(BaseModel):
    name: str
    price: Decimal
    assigned_to: List[str]


class SplitBase(BaseModel):
    title: str
    total_amount: Decimal
    participants: List[Participant]
    items: List[Item]


class SplitCreate(SplitBase):
    pass


class SplitUpdate(BaseModel):
    title: Optional[str] = None
    total_amount: Optional[Decimal] = None
    participants: Optional[List[Participant]] = None
    items: Optional[List[Item]] = None
    status: Optional[str] = None


class SplitResponse(SplitBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


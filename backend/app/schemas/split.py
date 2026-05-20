from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID
from typing import List, Optional


class ParticipantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    upi_id: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$')

    @field_validator("upi_id", mode="before")
    @classmethod
    def empty_upi_to_none(cls, value):
        if value == "":
            return None
        return value


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantResponse(ParticipantBase):
    id: UUID
    amount: float
    upi_link: str
    qr_code: str
    payment_status: str
    
    model_config = ConfigDict(from_attributes=True)


class SplitCreate(BaseModel):
    total_amount: float = Field(..., gt=0, description="Total bill amount")
    participants: List[ParticipantCreate] = Field(..., min_length=1)
    split_type: str = Field(default="equal", pattern="^(equal|custom|percentage)$")
    metadata: dict = Field(default_factory=dict)
    
    @field_validator('total_amount')
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        if v > 1000000:
            raise ValueError('Amount too large')
        return round(v, 2)


class SplitResponse(BaseModel):
    split_id: UUID
    total_amount: float
    split_type: str
    participants: List[ParticipantResponse]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class SplitListItem(BaseModel):
    split_id: UUID
    total_amount: float
    participant_count: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MarkPaidRequest(BaseModel):
    participant_id: UUID

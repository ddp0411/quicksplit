from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, JSON, String, Uuid
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class SplitType(str, enum.Enum):
    EQUAL = "equal"
    CUSTOM = "custom"
    PERCENTAGE = "percentage"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class Split(Base):
    __tablename__ = "splits"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    split_type = Column(Enum(SplitType), default=SplitType.EQUAL)
    meta = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="splits")
    participants = relationship("Participant", back_populates="split", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    split_id = Column(Uuid(as_uuid=True), ForeignKey("splits.id"), nullable=False)
    name = Column(String, nullable=False)
    upi_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    split = relationship("Split", back_populates="participants")

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class DatasetEntry(Base):
    __tablename__ = "dataset_entries"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    image_path = Column(String, nullable=False)
    image_hash = Column(String, unique=True, index=True, nullable=False)
    ocr_text = Column(Text, nullable=False)
    detected_total = Column(Float, nullable=True)
    actual_total = Column(Float, nullable=False)
    confidence = Column(Float, nullable=True)
    meta = Column("metadata", JSON, default=dict)
    annotations = Column(JSON, default=dict)
    is_verified = Column(Integer, default=0)  # 0: unverified, 1: verified, -1: rejected
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="dataset_submissions")

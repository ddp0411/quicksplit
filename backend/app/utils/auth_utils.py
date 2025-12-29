# Auth utilities
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings


def generate_token_expiry() -> datetime:
    """Generate token expiry datetime."""
    return datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)


def is_token_expired(expiry: datetime) -> bool:
    """Check if token is expired."""
    return datetime.utcnow() > expiry


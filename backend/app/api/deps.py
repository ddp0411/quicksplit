from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.services.cache_service import cache_service

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user
    Validates JWT token and retrieves user from database
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    cached_session = await cache_service.get_json(f"session:{token}")
    user_id: Optional[str] = (
        cached_session.get("user_id") if isinstance(cached_session, dict) else payload.get("sub")
    )
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency to ensure user is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user

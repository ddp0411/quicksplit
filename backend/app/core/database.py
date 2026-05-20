from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from .config import settings

engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True,
    "pool_pre_ping": True,
}

if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({"pool_size": 10, "max_overflow": 20})

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create declarative base
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function that provides database session.
    Usage: db: AsyncSession = Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    # Import models before create_all so SQLAlchemy metadata is populated.
    from app.models import dataset, split, user  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

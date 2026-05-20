import json
import logging
from typing import Any, Optional

import redis.asyncio as redis

from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """Small Redis wrapper that degrades gracefully when Redis is unavailable."""

    def __init__(self) -> None:
        self._client: Optional[redis.Redis] = None

    async def _get_client(self) -> Optional[redis.Redis]:
        if self._client is None:
            try:
                self._client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                await self._client.ping()
            except Exception as exc:
                logger.warning("Redis cache unavailable: %s", exc)
                self._client = None
        return self._client

    async def get_json(self, key: str) -> Any | None:
        client = await self._get_client()
        if client is None:
            return None
        try:
            value = await client.get(key)
            return json.loads(value) if value else None
        except Exception as exc:
            logger.warning("Redis get failed for %s: %s", key, exc)
            return None

    async def set_json(self, key: str, value: Any, ttl_seconds: int = 3600) -> None:
        client = await self._get_client()
        if client is None:
            return
        try:
            await client.setex(key, ttl_seconds, json.dumps(value, default=str))
        except Exception as exc:
            logger.warning("Redis set failed for %s: %s", key, exc)

    async def delete(self, key: str) -> None:
        client = await self._get_client()
        if client is None:
            return
        try:
            await client.delete(key)
        except Exception as exc:
            logger.warning("Redis delete failed for %s: %s", key, exc)

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None


cache_service = CacheService()

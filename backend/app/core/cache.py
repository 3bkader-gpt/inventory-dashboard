import json
from typing import Optional, Any
import redis.asyncio as redis
from app.config import get_settings

settings = get_settings()

class CacheService:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        """Initialize Redis connection."""
        try:
            self.redis = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=2.0,  # 2 second timeout
                socket_connect_timeout=2.0,
            )
            await self.redis.ping()
            print("✅ Redis Connected")
        except Exception as e:
            print(f"⚠️ Redis Connection Failed: {e}")
            self.redis = None

    async def disconnect(self):
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.redis:
            return None
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            print(f"Cache GET error: {e}")
        return None

    async def set(self, key: str, value: Any, expire: int = 60):
        """Set value in cache with TTL."""
        if not self.redis:
            return
        try:
            await self.redis.set(key, json.dumps(value), ex=expire)
        except Exception as e:
            print(f"Cache SET error: {e}")

    async def delete_pattern(self, pattern: str):
        """Delete keys matching pattern."""
        if not self.redis:
            return
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
        except Exception as e:
            print(f"Cache DELETE error: {e}")

# Global Cache Instance
cache = CacheService()

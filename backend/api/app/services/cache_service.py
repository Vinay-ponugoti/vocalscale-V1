import json
import logging
from typing import Any, Optional, Type, TypeVar, Union
from datetime import timedelta
import redis
from pydantic import BaseModel

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)

class CacheService:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.default_ttl = 300  # 5 minutes

    def _serialize(self, data: Any) -> str:
        if isinstance(data, BaseModel):
            return data.model_dump_json()
        if isinstance(data, list):
            return json.dumps([item.model_dump() if isinstance(item, BaseModel) else item for item in data])
        return json.dumps(data)

    def _deserialize(self, data: str, model: Optional[Type[T]] = None, is_list: bool = False) -> Any:
        parsed = json.loads(data)
        if model:
            if is_list:
                return [model.model_validate(item) for item in parsed]
            return model.model_validate(parsed)
        return parsed

    def get(self, key: str, model: Optional[Type[T]] = None, is_list: bool = False) -> Optional[Union[T, list[T], Any]]:
        try:
            data = self.redis.get(key)
            if data:
                return self._deserialize(data, model, is_list)
        except Exception as e:
            logger.warning(f"Cache read error for {key}: {e}")
            print(f"Cache read error for {key}: {e}")
        return None

    def set(self, key: str, data: Any, ttl: Optional[int] = None) -> bool:
        try:
            serialized = self._serialize(data)
            self.redis.setex(key, ttl or self.default_ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache write error for {key}: {e}")
            print(f"Cache write error for {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        try:
            deleted = self.redis.delete(key)
            return bool(deleted)
        except Exception as e:
            logger.error(f"Cache delete error for {key}: {e}")
            return False

    def invalidate_pattern(self, pattern: str) -> int:
        try:
            keys = self.redis.keys(pattern)
            if keys:
                return self.redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache pattern invalidation error for {pattern}: {e}")
            return 0

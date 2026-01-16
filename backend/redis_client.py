import redis
import json
from typing import Optional, Any
from backend.config import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)


def set_cache(key: str, value: Any, expire: Optional[int] = None):
    """设置缓存"""
    if isinstance(value, (dict, list)):
        value = json.dumps(value)
    redis_client.set(key, value, ex=expire)


def get_cache(key: str) -> Optional[str]:
    """获取缓存"""
    return redis_client.get(key)


def delete_cache(key: str):
    """删除缓存"""
    redis_client.delete(key)


def exists_cache(key: str) -> bool:
    """检查缓存是否存在"""
    return redis_client.exists(key) > 0

from fastapi import Depends
from app.core.config import get_settings, Settings
from app.services.voice_service import VoiceService
from app.services.tts_service import TTSService
from app.services.dashboard_service import DashboardService
from app.services.cache_service import CacheService
import redis

# Global Redis pool with optimized settings
_redis_pool = None

def get_redis(settings: Settings = Depends(get_settings)) -> redis.Redis:
    global _redis_pool
    if _redis_pool is None:
        # Optimized connection pool for production
        _redis_pool = redis.ConnectionPool.from_url(
            settings.redis_url,
            max_connections=50,  # Maximum connections in pool
            socket_connect_timeout=5,  # 5 second connection timeout
            socket_timeout=5,  # 5 second socket timeout
            socket_keepalive=True,  # Keep connections alive
            health_check_interval=30,  # Check health every 30s
            retry_on_timeout=True,
            decode_responses=False  # Keep binary for better performance
        )
    return redis.Redis(connection_pool=_redis_pool)

def get_cache_service(redis_client: redis.Redis = Depends(get_redis)) -> CacheService:
    return CacheService(redis_client)

def get_voice_service(settings: Settings = Depends(get_settings)) -> VoiceService:
    return VoiceService(settings)

def get_tts_service(settings: Settings = Depends(get_settings), redis_client: redis.Redis = Depends(get_redis)) -> TTSService:
    return TTSService(settings, redis_client)

def get_dashboard_service(settings: Settings = Depends(get_settings), cache: CacheService = Depends(get_cache_service)) -> DashboardService:
    return DashboardService(settings, cache)

def get_redis_client(settings: Settings = Depends(get_settings)) -> redis.Redis:
    """Get Redis client for caching and WebSocket management"""
    return get_redis(settings)

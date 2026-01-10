from fastapi import APIRouter, Response, status
import redis
from app.core.config import get_settings
from supabase import create_client

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    """Liveness check: Is the service up and responding?"""
    return {"status": "healthy"}

@router.get("/ready")
async def readiness_check():
    """Readiness check: Are dependencies (Redis, DB) available?"""
    settings = get_settings()
    issues = {}

    # 1. Check Redis
    try:
        r = redis.Redis.from_url(settings.redis_url)
        if not r.ping():
            issues["redis"] = "Redis ping failed"
    except Exception as e:
        issues["redis"] = f"Redis connection failed: {str(e)}"

    # 2. Check Supabase/DB
    try:
        supabase = create_client(settings.supabase_url, settings.supabase_key.get_secret_value())
        # Simple query to check connectivity
        supabase.table("calls").select("count", count="exact").limit(1).execute()
    except Exception as e:
        issues["database"] = f"Database connection failed: {str(e)}"

    if issues:
        return Response(
            content={"status": "unready", "issues": issues},
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            media_type="application/json"
        )

    return {"status": "ready"}

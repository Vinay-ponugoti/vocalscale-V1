from celery import Celery
import os
from app.core.config import get_settings

settings = get_settings()
redis_url = settings.redis_url

celery_app = Celery(
    "voice_ai",
    broker=redis_url,
    backend=redis_url,
    include=["app.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
)

if __name__ == "__main__":
    celery_app.start()

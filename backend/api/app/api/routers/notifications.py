from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import logging

from app.middleware.auth import get_current_user, AuthenticatedUser
from app.services.notification_service import NotificationService
from app.api.dependencies import get_redis_client

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    user: AuthenticatedUser = Depends(get_current_user),
    redis_client = Depends(get_redis_client)
):
    """Get notifications for the current user"""
    try:
        notification_service = NotificationService(redis_client)
        notifications = await notification_service.get_user_notifications(
            user.user_id, 
            unread_only=unread_only, 
            limit=limit
        )
        
        return {
            "notifications": [
                {
                    "id": n.id,
                    "type": n.type.value,
                    "title": n.title,
                    "message": n.message,
                    "data": n.data,
                    "read": n.read,
                    "created_at": n.created_at.isoformat(),
                    "expires_at": n.expires_at.isoformat() if n.expires_at else None
                }
                for n in notifications
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get notifications: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    redis_client = Depends(get_redis_client)
):
    """Mark a notification as read"""
    try:
        notification_service = NotificationService(redis_client)
        success = await notification_service.mark_notification_read(user.user_id, notification_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to mark notification as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")

@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    user: AuthenticatedUser = Depends(get_current_user),
    redis_client = Depends(get_redis_client)
):
    """Mark all notifications as read"""
    try:
        notification_service = NotificationService(redis_client)
        marked_count = await notification_service.mark_all_notifications_read(user.user_id)
        
        return {"message": f"Marked {marked_count} notifications as read"}
        
    except Exception as e:
        logger.error(f"Failed to mark all notifications as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark notifications as read")

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    redis_client = Depends(get_redis_client)
):
    """Delete a notification"""
    try:
        notification_service = NotificationService(redis_client)
        success = await notification_service.delete_notification(user.user_id, notification_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete notification")

@router.get("/notifications/counts")
async def get_notification_counts(
    user: AuthenticatedUser = Depends(get_current_user),
    redis_client = Depends(get_redis_client)
):
    """Get notification counts for the current user"""
    try:
        notification_service = NotificationService(redis_client)
        counts = await notification_service.get_notification_counts(user.user_id)
        
        return counts
        
    except Exception as e:
        logger.error(f"Failed to get notification counts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notification counts")
import logging
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)

class NotificationType(Enum):
    VOICE_PROCESSING_STARTED = "voice_processing_started"
    VOICE_PROCESSING_COMPLETED = "voice_processing_completed"
    VOICE_PROCESSING_FAILED = "voice_processing_failed"
    VOICE_QUALITY_LOW = "voice_quality_low"
    VOICE_SETUP_REMINDER = "voice_setup_reminder"
    VOICE_CLONE_READY = "voice_clone_ready"

@dataclass
class Notification:
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    read: bool = False
    created_at: datetime = None
    expires_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.type is not None and isinstance(self.type, str):
            self.type = NotificationType(self.type)

class NotificationService:
    """Service for managing user notifications"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client
        self.notification_ttl = 2592000  # 30 days in seconds
        
    async def create_notification(self, user_id: str, notification_type: NotificationType, 
                                title: str, message: str, data: Optional[Dict[str, Any]] = None,
                                expires_in_hours: Optional[int] = None) -> str:
        """Create a new notification for a user"""
        notification_id = f"{user_id}_{int(datetime.utcnow().timestamp() * 1000)}"
        
        # Calculate expiration
        expires_at = None
        if expires_in_hours:
            expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        notification = Notification(
            id=notification_id,
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            data=data,
            expires_at=expires_at
        )
        
        # Store in Redis
        if self.redis:
            await self._store_notification(notification)
        
        # Log notification
        logger.info(f"Created notification for user {user_id}: {notification_type.value} - {title}")
        
        return notification_id
    
    async def get_user_notifications(self, user_id: str, unread_only: bool = False, 
                                  limit: int = 50) -> List[Notification]:
        """Get notifications for a user"""
        if not self.redis:
            return []
        
        try:
            # Get notification keys for user
            pattern = f"notification:{user_id}:*"
            keys = self.redis.keys(pattern)
            
            if not keys:
                return []
            
            # Sort by timestamp (newest first)
            keys.sort(reverse=True)
            
            # Limit results
            keys = keys[:limit]
            
            notifications = []
            for key in keys:
                notification_data = self.redis.get(key)
                if notification_data:
                    try:
                        notification_dict = json.loads(notification_data)
                        notification = Notification(**notification_dict)
                        
                        # Skip if expired
                        if notification.expires_at and datetime.utcnow() > notification.expires_at:
                            self.redis.delete(key)
                            continue
                        
                        # Skip if read and we only want unread
                        if unread_only and notification.read:
                            continue
                        
                        notifications.append(notification)
                        
                    except Exception as e:
                        logger.error(f"Failed to parse notification {key}: {e}")
                        self.redis.delete(key)  # Clean up corrupted notification
            
            return notifications
            
        except Exception as e:
            logger.error(f"Failed to get notifications for user {user_id}: {e}")
            return []
    
    async def mark_notification_read(self, user_id: str, notification_id: str) -> bool:
        """Mark a notification as read"""
        if not self.redis:
            return False
        
        try:
            key = f"notification:{user_id}:{notification_id}"
            notification_data = self.redis.get(key)
            
            if notification_data:
                notification_dict = json.loads(notification_data)
                notification_dict['read'] = True
                notification_dict['read_at'] = datetime.utcnow().isoformat()
                
                self.redis.set(key, json.dumps(notification_dict), ex=self.notification_ttl)
                return True
                
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {e}")
        
        return False
    
    async def mark_all_notifications_read(self, user_id: str) -> int:
        """Mark all notifications for a user as read"""
        if not self.redis:
            return 0
        
        try:
            pattern = f"notification:{user_id}:*"
            keys = self.redis.keys(pattern)
            
            marked_count = 0
            for key in keys:
                notification_data = self.redis.get(key)
                if notification_data:
                    try:
                        notification_dict = json.loads(notification_data)
                        if not notification_dict.get('read'):
                            notification_dict['read'] = True
                            notification_dict['read_at'] = datetime.utcnow().isoformat()
                            
                            self.redis.set(key, json.dumps(notification_dict), ex=self.notification_ttl)
                            marked_count += 1
                            
                    except Exception as e:
                        logger.error(f"Failed to mark notification {key} as read: {e}")
            
            logger.info(f"Marked {marked_count} notifications as read for user {user_id}")
            return marked_count
            
        except Exception as e:
            logger.error(f"Failed to mark all notifications as read for user {user_id}: {e}")
            return 0
    
    async def delete_notification(self, user_id: str, notification_id: str) -> bool:
        """Delete a notification"""
        if not self.redis:
            return False
        
        try:
            key = f"notification:{user_id}:{notification_id}"
            result = self.redis.delete(key)
            return result > 0
            
        except Exception as e:
            logger.error(f"Failed to delete notification: {e}")
            return False
    
    async def cleanup_expired_notifications(self) -> int:
        """Clean up expired notifications (maintenance task)"""
        if not self.redis:
            return 0
        
        try:
            pattern = "notification:*"
            keys = self.redis.keys(pattern)
            
            deleted_count = 0
            for key in keys:
                notification_data = self.redis.get(key)
                if notification_data:
                    try:
                        notification_dict = json.loads(notification_data)
                        expires_at_str = notification_dict.get('expires_at')
                        
                        if expires_at_str:
                            expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
                            if datetime.utcnow() > expires_at:
                                self.redis.delete(key)
                                deleted_count += 1
                                
                    except Exception:
                        # Delete corrupted notifications
                        self.redis.delete(key)
                        deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} expired notifications")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup expired notifications: {e}")
            return 0
    
    async def get_notification_counts(self, user_id: str) -> Dict[str, int]:
        """Get notification counts for a user"""
        if not self.redis:
            return {"total": 0, "unread": 0}
        
        try:
            notifications = await self.get_user_notifications(user_id)
            total = len(notifications)
            unread = sum(1 for n in notifications if not n.read)
            
            return {"total": total, "unread": unread}
            
        except Exception as e:
            logger.error(f"Failed to get notification counts for user {user_id}: {e}")
            return {"total": 0, "unread": 0}
    
    async def _store_notification(self, notification: Notification):
        """Store notification in Redis"""
        try:
            key = f"notification:{notification.user_id}:{notification.id}"
            
            notification_dict = {
                "id": notification.id,
                "user_id": notification.user_id,
                "type": notification.type.value if isinstance(notification.type, NotificationType) else notification.type,
                "title": notification.title,
                "message": notification.message,
                "data": notification.data,
                "read": notification.read,
                "created_at": notification.created_at.isoformat(),
                "expires_at": notification.expires_at.isoformat() if notification.expires_at else None
            }
            
            # Store with TTL
            ttl = self.notification_ttl
            if notification.expires_at:
                ttl = int((notification.expires_at - datetime.utcnow()).total_seconds())
                ttl = max(ttl, 60)  # Minimum 1 minute TTL
            
            self.redis.set(key, json.dumps(notification_dict), ex=ttl)
            
        except Exception as e:
            logger.error(f"Failed to store notification: {e}")
    
    async def create_voice_processing_notifications(self, user_id: str, clone_id: str, 
                                               status: str, message: str = None) -> Optional[str]:
        """Create voice processing related notifications"""
        if status == "started":
            return await self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.VOICE_PROCESSING_STARTED,
                title="Voice Processing Started",
                message=f"Your voice clone (ID: {clone_id}) is being processed. This usually takes 1-2 minutes.",
                data={"clone_id": clone_id, "status": status},
                expires_in_hours=2  # Expires in 2 hours
            )
        
        elif status == "completed":
            return await self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.VOICE_PROCESSING_COMPLETED,
                title="Voice Clone Ready! 🎉",
                message="Your voice clone has been successfully created and is ready to use.",
                data={"clone_id": clone_id, "status": status}
            )
        
        elif status == "failed":
            return await self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.VOICE_PROCESSING_FAILED,
                title="Voice Processing Failed",
                message=f"Your voice clone processing failed. {message or 'Please try again.'}",
                data={"clone_id": clone_id, "status": status, "error": message}
            )
        
        return None
    
    async def create_voice_quality_notification(self, user_id: str, quality_score: int, 
                                          recommendations: List[str]) -> Optional[str]:
        """Create notification for low voice quality"""
        if quality_score >= 60:
            return None
        
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.VOICE_QUALITY_LOW,
            title="Voice Quality Needs Improvement",
            message=f"Your recording quality score is {quality_score}/100. Consider the following recommendations.",
            data={"quality_score": quality_score, "recommendations": recommendations}
        )
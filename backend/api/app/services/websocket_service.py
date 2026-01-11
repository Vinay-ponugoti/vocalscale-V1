import logging
import json
import asyncio
from typing import Dict, Set, Optional, Any, List
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self, redis_client: Optional[Any] = None):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.redis_client = redis_client
        self._heartbeat_task: Optional[asyncio.Task] = None
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a WebSocket for a user"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected for user {user_id}. Total connections: {len(self.active_connections[user_id])}")
        
        # Start heartbeat task if not running
        if self._heartbeat_task is None or self._heartbeat_task.done():
            self._heartbeat_task = asyncio.create_task(self._run_heartbeat())

        # Send welcome message
        await self.send_personal_message({
            "type": "connection",
            "status": "connected",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Real-time updates enabled"
        }, user_id)
    
    async def _run_heartbeat(self):
        """Periodically send pings to all connections to detect zombie connections"""
        while True:
            await asyncio.sleep(30) # Check every 30 seconds
            if not self.active_connections:
                continue
                
            logger.debug("Running WebSocket heartbeat check")
            ping_message = {"type": "ping", "timestamp": datetime.utcnow().isoformat()}
            
            # Use list of keys to avoid "dictionary changed size during iteration"
            for user_id in list(self.active_connections.keys()):
                await self.send_personal_message(ping_message, user_id)

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a WebSocket"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # Clean up empty connection sets
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        logger.info(f"WebSocket disconnected for user {user_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        """Send a message to all connections for a specific user"""
        if user_id not in self.active_connections:
            return
        
        disconnected_connections = set()
        
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send WebSocket message to user {user_id}: {e}")
                disconnected_connections.add(connection)
        
        # Clean up disconnected connections
        for connection in disconnected_connections:
            self.disconnect(connection, user_id)
    
    async def broadcast_message(self, message: Dict[str, Any]):
        """Broadcast a message to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)
    
    async def send_voice_processing_update(self, user_id: str, clone_id: str, status: str, progress: Optional[int] = None, message: Optional[str] = None):
        """Send voice processing status updates"""
        update_message = {
            "type": "voice_processing",
            "clone_id": clone_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if progress is not None:
            update_message["progress"] = progress
            
        if message:
            update_message["message"] = message
        
        await self.send_personal_message(update_message, user_id)
        
        # Also store in Redis for backup/reconnection scenarios
        if self.redis_client:
            try:
                cache_key = f"voice_processing:{user_id}:{clone_id}"
                self.redis_client.setex(
                    cache_key, 
                    3600,  # 1 hour
                    json.dumps(update_message)
                )
            except Exception as e:
                logger.error(f"Failed to cache voice processing update: {e}")

class VoiceProcessingStatusService:
    """Service for tracking and broadcasting voice processing status"""
    
    def __init__(self, websocket_manager: WebSocketManager, redis_client: Optional[Any] = None):
        self.websocket_manager = websocket_manager
        self.redis_client = redis_client
        self.processing_tasks: Dict[str, Dict[str, Any]] = {}
    
    async def start_processing(self, user_id: str, clone_id: str, total_steps: int = 5):
        """Initialize tracking for a voice processing task"""
        task_info = {
            "user_id": user_id,
            "clone_id": clone_id,
            "total_steps": total_steps,
            "current_step": 0,
            "status": "started",
            "start_time": datetime.utcnow(),
            "steps_completed": []
        }
        
        self.processing_tasks[f"{user_id}:{clone_id}"] = task_info
        
        await self.websocket_manager.send_voice_processing_update(
            user_id, clone_id, "processing", 0, "Voice processing started"
        )
        
        logger.info(f"Started tracking voice processing for {clone_id}")
    
    async def update_progress(self, user_id: str, clone_id: str, step_name: str, progress_increment: int = 1, message: Optional[str] = None):
        """Update progress for a voice processing task"""
        task_key = f"{user_id}:{clone_id}"
        
        if task_key not in self.processing_tasks:
            logger.warning(f"No tracking info found for {clone_id}")
            return
        
        task = self.processing_tasks[task_key]
        task["current_step"] += progress_increment
        task["steps_completed"].append(step_name)
        
        # Calculate progress percentage
        if task["total_steps"] > 0:
            progress_percentage = int((task["current_step"] / task["total_steps"]) * 100)
        else:
            progress_percentage = 0
            
        # Cap at 99% until complete
        progress_percentage = min(progress_percentage, 99)
        
        await self.websocket_manager.send_voice_processing_update(
            user_id, clone_id, "processing", progress_percentage, message or f"Step {task['current_step']}: {step_name}"
        )
        
        logger.info(f"Updated progress for {clone_id}: {progress_percentage}% - {step_name}")
    
    async def complete_processing(self, user_id: str, clone_id: str, result_url: Optional[str] = None):
        """Mark voice processing as completed"""
        task_key = f"{user_id}:{clone_id}"
        
        if task_key in self.processing_tasks:
            task = self.processing_tasks[task_key]
            task["status"] = "completed"
            task["end_time"] = datetime.utcnow()
            
            # Calculate processing duration
            duration = (task["end_time"] - task["start_time"]).total_seconds()
            
            await self.websocket_manager.send_voice_processing_update(
                user_id, clone_id, "completed", 100, f"Voice processing completed in {duration:.1f}s"
            )
            
            # Send result URL if available
            if result_url:
                await self.websocket_manager.send_personal_message({
                    "type": "voice_processing_complete",
                    "clone_id": clone_id,
                    "result_url": result_url,
                    "processing_time": duration,
                    "timestamp": datetime.utcnow().isoformat()
                }, user_id)
            
            # Clean up task tracking
            del self.processing_tasks[task_key]
            
            logger.info(f"Completed voice processing for {clone_id} in {duration:.1f}s")
    
    async def fail_processing(self, user_id: str, clone_id: str, error_message: str):
        """Mark voice processing as failed"""
        task_key = f"{user_id}:{clone_id}"
        
        if task_key in self.processing_tasks:
            task = self.processing_tasks[task_key]
            task["status"] = "failed"
            task["error"] = error_message
            task["end_time"] = datetime.utcnow()
            
            await self.websocket_manager.send_voice_processing_update(
                user_id, clone_id, "failed", None, f"Processing failed: {error_message}"
            )
            
            # Clean up task tracking
            del self.processing_tasks[task_key]
            
            logger.error(f"Voice processing failed for {clone_id}: {error_message}")
    
    async def get_cached_status(self, user_id: str, clone_id: str) -> Optional[Dict[str, Any]]:
        """Get cached status from Redis"""
        if not self.redis_client:
            return None
        
        try:
            cache_key = f"voice_processing:{user_id}:{clone_id}"
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Failed to get cached status: {e}")
        
        return None
    
    def get_active_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all active processing tasks for a user"""
        active_tasks = []
        
        for task_key, task in self.processing_tasks.items():
            if task["user_id"] == user_id:
                active_tasks.append({
                    "clone_id": task["clone_id"],
                    "status": task["status"],
                    "progress": int((task["current_step"] / task["total_steps"]) * 100),
                    "current_step": task["current_step"],
                    "total_steps": task["total_steps"],
                    "start_time": task["start_time"].isoformat()
                })
        
        return active_tasks
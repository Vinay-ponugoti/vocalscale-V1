from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
import logging
import asyncio
from typing import Optional
from app.services.websocket_service import WebSocketManager
from app.api.dependencies import get_redis_client
from app.middleware.auth import get_current_user_ws

logger = logging.getLogger(__name__)

router = APIRouter()

# Global manager instance
_manager: Optional[WebSocketManager] = None

# Connection limits for security
MAX_CONNECTIONS_PER_USER = 5
CONNECTION_TIMEOUT = 30  # seconds for initial auth
HEARTBEAT_INTERVAL = 30  # seconds
HEARTBEAT_TIMEOUT = 60  # seconds without heartbeat = disconnect


def get_websocket_manager(redis_client=Depends(get_redis_client)) -> WebSocketManager:
    global _manager
    if _manager is None:
        _manager = WebSocketManager(redis_client)
    return _manager


@router.websocket("/ws/notifications")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., min_length=50, max_length=4000),
    manager: WebSocketManager = Depends(get_websocket_manager)
):
    """
    WebSocket endpoint for real-time notifications and updates.
    Expects a 'token' query parameter for authentication.
    
    Security features:
    - Token validation with rate limiting
    - Connection limits per user
    - Heartbeat monitoring
    - Automatic disconnect on timeout
    """
    # Get client IP for logging and rate limiting
    client_ip = websocket.client.host if websocket.client else "unknown"
    
    # Authenticate user
    try:
        user = await asyncio.wait_for(
            get_current_user_ws(token, client_ip),
            timeout=CONNECTION_TIMEOUT
        )
    except asyncio.TimeoutError:
        logger.warning(f"WS auth timeout from {client_ip}")
        await websocket.close(code=1008)  # Policy Violation
        return
    except Exception as e:
        logger.error(f"WS auth error from {client_ip}: {type(e).__name__}")
        await websocket.close(code=1008)
        return
    
    if not user:
        logger.warning(f"WS auth failed from {client_ip}")
        await websocket.close(code=1008)  # Policy Violation
        return
    
    # Check connection limit per user
    current_connections = manager.get_user_connection_count(user.user_id) if hasattr(manager, 'get_user_connection_count') else 0
    if current_connections >= MAX_CONNECTIONS_PER_USER:
        logger.warning(f"WS connection limit exceeded for user {user.user_id[:8]}...")
        await websocket.close(code=1008)  # Policy Violation
        return
    
    # Accept connection
    await manager.connect(websocket, user.user_id)
    logger.info(f"WS connected: user={user.user_id[:8]}... ip={client_ip}")
    
    last_heartbeat = asyncio.get_event_loop().time()
    
    try:
        while True:
            try:
                # Wait for messages with timeout for heartbeat
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=HEARTBEAT_TIMEOUT
                )
                
                # Update heartbeat timestamp
                last_heartbeat = asyncio.get_event_loop().time()
                
                # Handle ping/pong for heartbeat
                if data == "ping":
                    await websocket.send_text("pong")
                elif data == "pong":
                    pass  # Client responded to our ping
                else:
                    # Log unexpected messages but don't process untrusted data
                    logger.debug(f"WS received message type: {data[:20] if data else 'empty'}...")
                    
            except asyncio.TimeoutError:
                # No message received - check if we should send a ping
                current_time = asyncio.get_event_loop().time()
                if current_time - last_heartbeat > HEARTBEAT_INTERVAL:
                    try:
                        await websocket.send_text("ping")
                    except Exception:
                        # Connection is dead
                        break
                        
    except WebSocketDisconnect:
        logger.info(f"WS disconnected: user={user.user_id[:8]}...")
    except Exception as e:
        logger.error(f"WS error for user {user.user_id[:8]}...: {type(e).__name__}")
    finally:
        manager.disconnect(websocket, user.user_id)


@router.websocket("/ws/health")
async def websocket_health(websocket: WebSocket):
    """Simple WebSocket health check endpoint (no auth required)"""
    await websocket.accept()
    try:
        await websocket.send_text("ok")
        await websocket.close()
    except Exception:
        pass

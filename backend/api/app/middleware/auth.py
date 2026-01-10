from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.core.config import get_settings, Settings
import logging
import time
import hashlib
from typing import Optional, Dict, Any
from collections import defaultdict
import asyncio

logger = logging.getLogger(__name__)
security = HTTPBearer()

# ===========================================
# BRUTE FORCE PROTECTION
# ===========================================
class RateLimitStore:
    """In-memory rate limiting for auth attempts (use Redis in production cluster)"""
    
    def __init__(self):
        self._attempts: Dict[str, list] = defaultdict(list)
        self._lockouts: Dict[str, float] = {}
        self._lock = asyncio.Lock()
        
        # Configuration
        self.max_attempts = 5  # Max failed attempts before lockout
        self.window_seconds = 300  # 5 minute window
        self.lockout_seconds = 900  # 15 minute lockout
    
    def _get_key(self, identifier: str) -> str:
        """Hash the identifier for privacy"""
        return hashlib.sha256(identifier.encode()).hexdigest()[:16]
    
    async def is_locked_out(self, identifier: str) -> bool:
        """Check if identifier is currently locked out"""
        key = self._get_key(identifier)
        async with self._lock:
            if key in self._lockouts:
                if time.time() < self._lockouts[key]:
                    return True
                else:
                    # Lockout expired, remove it
                    del self._lockouts[key]
                    self._attempts.pop(key, None)
            return False
    
    async def record_attempt(self, identifier: str, success: bool) -> None:
        """Record an authentication attempt"""
        key = self._get_key(identifier)
        current_time = time.time()
        
        async with self._lock:
            if success:
                # Clear attempts on successful auth
                self._attempts.pop(key, None)
                self._lockouts.pop(key, None)
                return
            
            # Record failed attempt
            self._attempts[key].append(current_time)
            
            # Clean old attempts outside window
            cutoff = current_time - self.window_seconds
            self._attempts[key] = [t for t in self._attempts[key] if t > cutoff]
            
            # Check if we need to lockout
            if len(self._attempts[key]) >= self.max_attempts:
                self._lockouts[key] = current_time + self.lockout_seconds
                logger.warning(f"Auth lockout triggered for identifier hash: {key}")
    
    async def get_remaining_attempts(self, identifier: str) -> int:
        """Get remaining attempts before lockout"""
        key = self._get_key(identifier)
        current_time = time.time()
        
        async with self._lock:
            cutoff = current_time - self.window_seconds
            recent_attempts = [t for t in self._attempts.get(key, []) if t > cutoff]
            return max(0, self.max_attempts - len(recent_attempts))

# Global rate limit store
_rate_limit_store = RateLimitStore()

def get_rate_limit_store() -> RateLimitStore:
    return _rate_limit_store


# ===========================================
# AUTHENTICATED USER MODEL
# ===========================================
class AuthenticatedUser:
    """Represents an authenticated user with validated credentials"""
    
    def __init__(self, user_id: str, token: str, email: str = "", user_metadata: Dict[str, Any] = None):
        if not user_id or not isinstance(user_id, str):
            raise ValueError("Invalid user_id")
        self.user_id = user_id
        self.token = token
        self.email = email or ""
        self.user_metadata = user_metadata or {}
    
    def __repr__(self) -> str:
        return f"AuthenticatedUser(user_id={self.user_id[:8]}...)"


# ===========================================
# TOKEN VALIDATION
# ===========================================
def _validate_token_format(token: str) -> bool:
    """Basic token format validation before making external calls"""
    if not token or not isinstance(token, str):
        return False
    # JWT tokens have 3 parts separated by dots
    parts = token.split('.')
    if len(parts) != 3:
        return False
    # Each part should be non-empty
    if not all(parts):
        return False
    # Reasonable length check (JWTs are typically 100-2000 chars)
    if len(token) < 50 or len(token) > 4000:
        return False
    return True


# ===========================================
# MAIN AUTH DEPENDENCY
# ===========================================
async def get_current_user(
    request: Request,
    creds: HTTPAuthorizationCredentials = Depends(security),
    settings: Settings = Depends(get_settings)
) -> AuthenticatedUser:
    """
    Authenticate user from Bearer token with brute force protection.
    """
    token = creds.credentials
    
    # Get client identifier for rate limiting (IP + User-Agent hash)
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")[:100]
    identifier = f"{client_ip}:{hashlib.sha256(user_agent.encode()).hexdigest()[:8]}"
    
    rate_limiter = get_rate_limit_store()
    
    # Check for lockout
    if await rate_limiter.is_locked_out(identifier):
        logger.warning(f"Auth attempt from locked out client: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please try again later.",
            headers={"Retry-After": str(rate_limiter.lockout_seconds)},
        )
    
    # Validate token format before making external call
    if not _validate_token_format(token):
        await rate_limiter.record_attempt(identifier, success=False)
        logger.warning(f"Invalid token format from {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify token with Supabase Auth API
    url = f"{settings.supabase_url}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": settings.supabase_key.get_secret_value()
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            
            if resp.status_code == 401:
                await rate_limiter.record_attempt(identifier, success=False)
                remaining = await rate_limiter.get_remaining_attempts(identifier)
                logger.warning(f"Invalid token from {client_ip}, {remaining} attempts remaining")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            if resp.status_code != 200:
                # Don't count server errors as failed attempts
                logger.error(f"Supabase auth error: Status {resp.status_code}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Authentication service temporarily unavailable",
                )
            
            user_data = resp.json()
            user_id = user_data.get("id")
            email = user_data.get("email")
            user_metadata = user_data.get("user_metadata", {})
            
            if not user_id:
                await rate_limiter.record_attempt(identifier, success=False)
                logger.error("User data missing ID field")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                )
            
            # Successful auth - clear any failed attempts
            await rate_limiter.record_attempt(identifier, success=True)
            
            # Don't log user_id in production (privacy)
            if settings.is_development:
                logger.debug(f"Authenticated user: {user_id}")
            
            return AuthenticatedUser(user_id=user_id, token=token, email=email, user_metadata=user_metadata)
            
        except HTTPException:
            raise
        except httpx.TimeoutException:
            logger.error("Timeout while authenticating user")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service temporarily unavailable",
            )
        except httpx.RequestError as e:
            logger.error(f"Request error during auth: {type(e).__name__}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service temporarily unavailable",
            )
        except ValueError as e:
            logger.error(f"Value error in auth: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        except Exception as e:
            # Log the actual error but don't expose it
            logger.error(f"Unexpected auth error: {type(e).__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication error",
            )


# ===========================================
# WEBSOCKET AUTH (with security improvements)
# ===========================================
async def get_current_user_ws(token: str, client_ip: str = "unknown") -> Optional[AuthenticatedUser]:
    """
    Authentication helper for WebSockets using token from query param.
    Returns None on failure instead of raising exceptions.
    """
    if not token:
        logger.warning(f"WS auth attempt without token from {client_ip}")
        return None
    
    # Validate token format
    if not _validate_token_format(token):
        logger.warning(f"WS auth with invalid token format from {client_ip}")
        return None
    
    settings = get_settings()
    rate_limiter = get_rate_limit_store()
    
    # Check for lockout
    if await rate_limiter.is_locked_out(client_ip):
        logger.warning(f"WS auth attempt from locked out client: {client_ip}")
        return None
    
    url = f"{settings.supabase_url}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": settings.supabase_key.get_secret_value()
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            
            if resp.status_code == 401:
                await rate_limiter.record_attempt(client_ip, success=False)
                logger.warning(f"WS auth failed for {client_ip}")
                return None
            
            if resp.status_code != 200:
                logger.error(f"WS auth service error: {resp.status_code}")
                return None
            
            user_data = resp.json()
            user_id = user_data.get("id")
            
            if not user_id:
                await rate_limiter.record_attempt(client_ip, success=False)
                return None
            
            # Success
            await rate_limiter.record_attempt(client_ip, success=True)
            
            return AuthenticatedUser(
                user_id=user_id,
                token=token,
                email=user_data.get("email", "")
            )
        except httpx.TimeoutException:
            logger.error("WS auth timeout")
            return None
        except httpx.RequestError:
            logger.error("WS auth request error")
            return None
        except Exception as e:
            logger.error(f"WS auth unexpected error: {type(e).__name__}")
            return None


# ===========================================
# OPTIONAL USER (for public endpoints that benefit from auth)
# ===========================================
async def get_optional_user(
    request: Request,
    settings: Settings = Depends(get_settings)
) -> Optional[AuthenticatedUser]:
    """
    Get user if authenticated, None otherwise.
    Useful for endpoints that work both with and without auth.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ", 1)[1]
    client_ip = request.client.host if request.client else "unknown"
    
    return await get_current_user_ws(token, client_ip)


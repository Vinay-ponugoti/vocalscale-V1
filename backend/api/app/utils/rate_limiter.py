"""Rate limiting and abuse prevention utilities"""
import time
from collections import defaultdict
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """In-memory rate limiter with sliding window"""
    
    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        """
        Args:
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)
    
    def is_allowed(self, key: str) -> Tuple[bool, dict]:
        """
        Check if a request is allowed for the given key.
        
        Args:
            key: Identifier (e.g., IP, email, user_id)
            
        Returns:
            Tuple of (allowed: bool, info: dict with remaining_requests and retry_after)
        """
        now = time.time()
        
        # Clean old requests outside the window
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if now - req_time < self.window_seconds
        ]
        
        remaining = self.max_requests - len(self.requests[key])
        
        if remaining > 0:
            self.requests[key].append(now)
            return True, {
                "remaining_requests": remaining - 1,
                "retry_after": None,
                "reset_at": now + self.window_seconds
            }
        else:
            # Calculate when they can retry
            oldest_request = self.requests[key][0]
            retry_after = int(self.window_seconds - (now - oldest_request) + 1)
            return False, {
                "remaining_requests": 0,
                "retry_after": retry_after,
                "reset_at": oldest_request + self.window_seconds
            }
    
    def get_info(self, key: str) -> dict:
        """Get current rate limit info for a key"""
        now = time.time()
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if now - req_time < self.window_seconds
        ]
        
        remaining = self.max_requests - len(self.requests[key])
        oldest_request = self.requests[key][0] if self.requests[key] else now
        
        return {
            "remaining_requests": max(0, remaining),
            "retry_after": None if remaining > 0 else int(self.window_seconds - (now - oldest_request) + 1),
            "reset_at": oldest_request + self.window_seconds
        }
    
    def reset(self, key: str) -> None:
        """Reset rate limit for a key"""
        if key in self.requests:
            del self.requests[key]


class AbuseDetector:
    """Detect and prevent abuse patterns"""
    
    def __init__(self):
        self.failed_attempts: dict[str, list[float]] = defaultdict(list)
        self.blocked_keys: dict[str, float] = {}  # key -> unblock_time
        
        # Configuration
        self.max_failed_attempts = 5  # Max failed attempts before temporary block
        self.block_duration = 300  # 5 minutes
        self.attempt_window = 60  # Look at attempts in last 60 seconds
    
    def record_failed_attempt(self, key: str) -> Tuple[bool, Optional[str]]:
        """
        Record a failed login attempt.
        
        Args:
            key: Identifier (e.g., email, IP)
            
        Returns:
            Tuple of (is_allowed: bool, reason: Optional[str])
        """
        now = time.time()
        
        # Check if currently blocked
        if key in self.blocked_keys and now < self.blocked_keys[key]:
            remaining = int(self.blocked_keys[key] - now)
            return False, f"Account temporarily locked. Try again in {remaining} seconds."
        elif key in self.blocked_keys:
            # Unblock time has passed
            del self.blocked_keys[key]
            self.failed_attempts[key] = []
        
        # Clean old attempts outside window
        self.failed_attempts[key] = [
            attempt_time for attempt_time in self.failed_attempts[key]
            if now - attempt_time < self.attempt_window
        ]
        
        # Record this attempt
        self.failed_attempts[key].append(now)
        
        # Check if we exceed max attempts
        if len(self.failed_attempts[key]) >= self.max_failed_attempts:
            self.blocked_keys[key] = now + self.block_duration
            logger.warning(f"Abuse detected: {key} blocked for {self.block_duration}s after {self.max_failed_attempts} failed attempts")
            return False, f"Too many failed attempts. Account locked for {self.block_duration} seconds."
        
        return True, None
    
    def record_successful_attempt(self, key: str) -> None:
        """Clear failed attempts on successful login"""
        if key in self.failed_attempts:
            del self.failed_attempts[key]
        if key in self.blocked_keys:
            del self.blocked_keys[key]
    
    def is_blocked(self, key: str) -> Tuple[bool, Optional[str]]:
        """Check if a key is currently blocked"""
        now = time.time()
        
        if key in self.blocked_keys:
            if now < self.blocked_keys[key]:
                remaining = int(self.blocked_keys[key] - now)
                return True, f"Account temporarily locked. Try again in {remaining} seconds."
            else:
                # Unblock time has passed
                del self.blocked_keys[key]
                self.failed_attempts[key] = []
                return False, None
        
        return False, None


# Global instances
login_rate_limiter = RateLimiter(max_requests=10, window_seconds=60)  # 10 requests per minute
signup_rate_limiter = RateLimiter(max_requests=5, window_seconds=300)  # 5 requests per 5 minutes
abuse_detector = AbuseDetector()

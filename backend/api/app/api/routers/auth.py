from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Dict, Any
from app.core.config import get_settings
from app.middleware.auth import get_current_user, get_rate_limit_store
from supabase import create_client, Client
import logging
import re
import hashlib
from urllib.parse import quote

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentication"])


# ===========================================
# INPUT VALIDATION MODELS
# ===========================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        # Normalize email
        v = v.strip().lower()
        if len(v) > 254:  # RFC 5321 limit
            raise ValueError("Email address too long")
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not v or len(v) < 1:
            raise ValueError("Password is required")
        if len(v) > 128:  # Reasonable max length
            raise ValueError("Password too long")
        return v


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    business_type: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) > 254:
            raise ValueError("Email address too long")
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(v) > 128:
            raise ValueError("Password too long")
        if not re.search("[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search("[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search("[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if len(v) > 100:
            raise ValueError("Name too long")
        # Basic sanitization - remove potential XSS
        v = re.sub(r'[<>"\']', '', v)
        return v if v else None
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        # Remove all non-digit characters except + at start
        v = v.strip()
        if not v:
            return None
        # Allow + at start, then only digits, spaces, dashes
        cleaned = re.sub(r'[^\d+\-\s]', '', v)
        if len(cleaned) > 20:
            raise ValueError("Phone number too long")
        return cleaned if cleaned else None
    
    @field_validator('business_type')
    @classmethod
    def validate_business_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if len(v) > 50:
            raise ValueError("Business type too long")
        # Basic sanitization
        v = re.sub(r'[<>"\']', '', v)
        return v if v else None


class AuthResponse(BaseModel):
    user: Dict[str, Any]
    session: Optional[Dict[str, Any]] = None


class GoogleSyncRequest(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: int


# ===========================================
# SUPABASE CLIENT HELPERS
# ===========================================
def get_supabase_client() -> Client:
    settings = get_settings()
    if not settings.supabase_key:
        logger.error("No Supabase anon key found in settings")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable"
        )
    return create_client(settings.supabase_url, settings.supabase_key.get_secret_value())


def get_supabase_admin_client() -> Client:
    settings = get_settings()
    key = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
    if not key:
        logger.error("No Supabase key found in settings")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable"
        )
    return create_client(settings.supabase_url, key.get_secret_value())


# ===========================================
# RATE LIMITING HELPER
# ===========================================
def _get_client_identifier(request: Request) -> str:
    """Get a unique identifier for rate limiting"""
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")[:100]
    return f"{client_ip}:{hashlib.sha256(user_agent.encode()).hexdigest()[:8]}"


# ===========================================
# AUTH ENDPOINTS
# ===========================================
@router.post("/google-sync")
async def google_sync(
    request: Request, 
    sync_data: GoogleSyncRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Sync Google OAuth tokens with the user's profile if refresh token is provided"""
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Only proceed if we have a refresh token (meaning the user granted Business permissions)
    if not sync_data.refresh_token:
        return {"status": "skipped", "message": "No refresh token provided, skipping profile sync"}
    
    admin_supabase = get_supabase_admin_client()
    
    try:
        # Update the profiles table instead of businesses
        profile_data = {
            "google_refresh_token": sync_data.refresh_token,
            "google_connected_at": "now()",
            "updated_at": "now()"
        }
        
        admin_supabase.table('profiles').update(profile_data).eq('id', user_id).execute()
        logger.info(f"Updated Google tokens in profile for user {user_id}")
            
        return {"status": "success", "message": "Google tokens synced successfully"}
        
    except Exception as e:
        logger.error(f"Error syncing Google tokens: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to sync Google tokens")


@router.post("/login", response_model=AuthResponse)
async def login(request: Request, login_data: LoginRequest):
    """Login with email and password via backend with rate limiting"""
    identifier = _get_client_identifier(request)
    rate_limiter = get_rate_limit_store()
    
    # Check for lockout
    if await rate_limiter.is_locked_out(identifier):
        client_ip = request.client.host if request.client else "unknown"
        logger.warning(f"Login attempt from locked out client: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please try again later.",
            headers={"Retry-After": str(rate_limiter.lockout_seconds)},
        )
    
    email = login_data.email  # Already normalized by validator
    
    # Don't log email in production
    settings = get_settings()
    if settings.is_development:
        logger.info(f"Attempting login for user: {email}")
    
    supabase = get_supabase_client()
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": login_data.password
        })
        
        if not auth_response.session:
            await rate_limiter.record_attempt(identifier, success=False)
            logger.warning("Login failed - No session returned")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Success - clear failed attempts
        await rate_limiter.record_attempt(identifier, success=True)
        logger.info("Login successful")
        
        # Convert to dict safely
        session = auth_response.session
        user = auth_response.user
        
        session_data = None
        if session is not None:
            session_data = session.model_dump() if hasattr(session, "model_dump") else dict(session)
        
        user_data: Dict[str, Any] = {}
        if user is not None:
            user_data = user.model_dump() if hasattr(user, "model_dump") else dict(user)
        
        return {
            "user": user_data,
            "session": session_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await rate_limiter.record_attempt(identifier, success=False)
        error_msg = str(e)
        logger.error(f"Login error: {type(e).__name__}")
        
        # Return generic error messages - don't leak info
        if "Invalid login credentials" in error_msg:
            detail = "Invalid email or password"
        elif "Email not confirmed" in error_msg:
            detail = "Please confirm your email address before logging in."
        else:
            detail = "Authentication failed"
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )


@router.post("/signup", response_model=AuthResponse)
async def signup(request: Request, signup_data: SignupRequest):
    """Signup with email and password via backend with rate limiting"""
    identifier = _get_client_identifier(request)
    rate_limiter = get_rate_limit_store()
    settings = get_settings()
    
    # Check for lockout (prevents mass account creation)
    if await rate_limiter.is_locked_out(identifier):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(rate_limiter.lockout_seconds)},
        )
    
    if settings.is_development:
        logger.info(f"Attempting signup for user: {signup_data.email}")
    
    supabase = get_supabase_client()
    admin_supabase = get_supabase_admin_client()
    
    try:
        # Sign up the user
        auth_response = supabase.auth.sign_up({
            "email": signup_data.email,
            "password": signup_data.password,
            "options": {
                "data": {
                    "full_name": signup_data.full_name or ""
                }
            }
        })
        
        if not auth_response.user:
            await rate_limiter.record_attempt(identifier, success=False)
            logger.warning("Signup failed - No user returned")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup failed. Please try again."
            )

        logger.info("Signup successful")
        
        # Update profile record
        user_id = auth_response.user.id
        profile_update = {
            "full_name": signup_data.full_name or "",
            "contact_phone": signup_data.phone or "",
            "business_type": signup_data.business_type or "",
            "updated_at": "now()"
        }
        
        try:
            admin_supabase.table('profiles').upsert({
                "id": user_id,
                "email": signup_data.email,
                **profile_update
            }).execute()
        except Exception as profile_error:
            # Don't fail signup if profile update fails
            logger.warning(f"Profile update warning: {type(profile_error).__name__}")
        
        # Success
        await rate_limiter.record_attempt(identifier, success=True)
        
        # Convert to dict safely
        session_data = None
        if auth_response.session:
            session_obj = auth_response.session
            session_data = session_obj.model_dump() if hasattr(session_obj, "model_dump") else dict(session_obj)
        
        user_obj = auth_response.user
        user_data = user_obj.model_dump() if hasattr(user_obj, "model_dump") else dict(user_obj) if user_obj else {}
        
        return {
            "user": user_data,
            "session": session_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await rate_limiter.record_attempt(identifier, success=False)
        error_msg = str(e)
        logger.error(f"Signup error: {type(e).__name__}")
        
        # Return user-friendly error messages
        if "already registered" in error_msg.lower():
            detail = "An account with this email already exists"
        elif "password" in error_msg.lower():
            detail = "Password does not meet requirements"
        else:
            detail = "Signup failed. Please try again."
            
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


@router.get("/validate")
@router.head("/validate")
async def validate_session(request: Request, user=Depends(get_current_user)):
    """Simple endpoint to validate if a token is still valid"""
    if request.method == "HEAD":
        return Response(status_code=200)
    return {
        "status": "ok", 
        "user_id": user.user_id, 
        "email": user.email,
        "user_metadata": user.user_metadata
    }


@router.post("/logout")
async def logout(request: Request, user=Depends(get_current_user)):
    """Logout current user and invalidate Supabase session"""
    supabase = get_supabase_client()
    
    try:
        supabase.auth.sign_out()
        logger.info("User logged out successfully")
    except Exception as e:
        # Log but don't fail - frontend should clear local state anyway
        logger.warning(f"Error during sign_out: {type(e).__name__}")
        
    return {"status": "ok", "message": "Successfully logged out"}


@router.get("/google-url")
async def get_google_auth_url(request: Request, redirect_to: Optional[str] = None):
    """Generate Google OAuth URL for basic login (email, profile)"""
    settings = get_settings()
    
    # Validate and sanitize redirect_to
    if redirect_to:
        allowed_origins = settings.cors_origins
        redirect_origin = redirect_to.split('/')[0] + '//' + redirect_to.split('/')[2] if '://' in redirect_to else None
        if redirect_origin and redirect_origin not in allowed_origins:
            redirect_to = None
    
    if not redirect_to:
        redirect_to = f"{settings.cors_origins[0]}/dashboard" if settings.cors_origins else "http://localhost:5173/dashboard"
    
    try:
        base_url = f"{settings.supabase_url}/auth/v1/authorize"
        scopes = "email profile"
        encoded_redirect = quote(redirect_to, safe='')
        
        auth_url = (
            f"{base_url}?provider=google"
            f"&scopes={quote(scopes, safe='')}"
            f"&redirect_to={encoded_redirect}"
        )
        return {"url": auth_url}
    except Exception as e:
        logger.error(f"Error generating Google login URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate login URL")


@router.get("/google-business-url")
async def get_google_business_auth_url(request: Request, redirect_to: Optional[str] = None):
    """Generate Google OAuth URL specifically for Business permissions"""
    settings = get_settings()
    
    if not redirect_to:
        redirect_to = f"{settings.cors_origins[0]}/dashboard/settings" if settings.cors_origins else "http://localhost:5173/dashboard/settings"
    
    try:
        base_url = f"{settings.supabase_url}/auth/v1/authorize"
        scopes = "https://www.googleapis.com/auth/business.manage"
        encoded_redirect = quote(redirect_to, safe='')
        
        # access_type=offline is CRITICAL here to get the refresh token
        auth_url = (
            f"{base_url}?provider=google"
            f"&scopes={quote(scopes, safe='')}"
            f"&prompt=consent"
            f"&access_type=offline"
            f"&redirect_to={encoded_redirect}"
        )
        return {"url": auth_url}
    except Exception as e:
        logger.error(f"Error generating Google business URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate business connection URL")

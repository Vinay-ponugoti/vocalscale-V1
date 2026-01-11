from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.twilio_subaccount_service import TwilioSubaccountService
from app.core.config import get_settings, Settings
from app.middleware.auth import get_current_user, AuthenticatedUser
from app.api.dependencies import get_cache_service
from app.services.cache_service import CacheService
from supabase import create_client

router = APIRouter()

class CreateSubaccountRequest(BaseModel):
    friendly_name: str

class SubaccountResponse(BaseModel):
    sid: str
    friendly_name: str
    status: str
    auth_token: Optional[str] = None
    account_sid: Optional[str] = None
    date_created: str
    date_updated: Optional[str] = None

    class Config:
        extra = "ignore"

class SubaccountStatusResponse(BaseModel):
    has_subaccount: bool
    subaccount: Optional[SubaccountResponse] = None
    phone_count: int = 0

def get_subaccount_service():
    """Dependency to get subaccount service"""
    return TwilioSubaccountService()

@router.post("/subaccounts/create", response_model=SubaccountResponse)
async def create_subaccount(
    request: CreateSubaccountRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
    cache: CacheService = Depends(get_cache_service),
    service: TwilioSubaccountService = Depends(get_subaccount_service)
):
    """
    Create a new Twilio subaccount for the current user.
    """
    try:
        # Check if user already has a subaccount
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        supabase = create_client(settings.supabase_url, key)
        
        existing = supabase.table("profiles").select("subaccount_sid").eq("id", current_user.user_id).execute()
        
        if existing.data and existing.data[0].get("subaccount_sid"):
            raise HTTPException(
                status_code=400,
                detail="User already has a subaccount"
            )

        # Create subaccount
        result = service.create_subaccount(request.friendly_name)
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to create Twilio subaccount"
            )

        # Update user profile with subaccount details
        supabase.table("profiles").update({
            "subaccount_sid": result["sid"],
            "subaccount_auth_token": result["auth_token"],
            "subaccount_status": "active"
        }).eq("id", current_user.user_id).execute()

        # Invalidate cache
        cache.delete(f"user:{current_user.user_id}:subaccount")
        cache.delete(f"user:{current_user.user_id}:profile")

        return SubaccountResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating subaccount: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subaccounts", response_model=SubaccountStatusResponse)
async def get_subaccount_status(
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
    cache: CacheService = Depends(get_cache_service),
    service: TwilioSubaccountService = Depends(get_subaccount_service)
):
    """
    Get the current user's subaccount status.
    """
    try:
        user_id = current_user.user_id
        cache_key = f"user:{user_id}:subaccount"
        
        # Try cache first
        cached = cache.get(cache_key, model=SubaccountStatusResponse)
        if cached:
            return cached
        
        # Get from database
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        supabase = create_client(settings.supabase_url, key)
        
        profile = supabase.table("profiles").select(
            "subaccount_sid, subaccount_auth_token, subaccount_status"
        ).eq("id", user_id).execute()
        
        if not profile.data or not profile.data[0].get("subaccount_sid"):
            print(f"DEBUG: No subaccount found for user {user_id} in profiles table")
            result = SubaccountStatusResponse(
                has_subaccount=False,
                subaccount=None,
                phone_count=0
            )
        else:
            subaccount_sid = profile.data[0]["subaccount_sid"]
            subaccount_status_in_db = profile.data[0].get("subaccount_status", "unknown")
            print(f"DEBUG: User {user_id} has subaccount_sid {subaccount_sid} with status {subaccount_status_in_db}")
            
            # Try to fetch from Twilio
            try:
                subaccount = service.get_subaccount(subaccount_sid)
                
                if subaccount:
                    # Get phone count for this user
                    phones = supabase.table("phone_numbers").select("*").eq("user_id", user_id).execute()
                    phone_count = len(phones.data)
                    
                    result = SubaccountStatusResponse(
                        has_subaccount=True,
                        subaccount=SubaccountResponse(**subaccount),
                        phone_count=phone_count
                    )
                else:
                    # Twilio returned None - might be 404 or other error
                    print(f"DEBUG: service.get_subaccount returned None for {subaccount_sid}")
                    
                    # If Twilio says it's gone but we have it in DB, we should clear it from DB
                    # to avoid the user being stuck in a loop where they can't create a new one.
                    print(f"DEBUG: Clearing invalid subaccount_sid {subaccount_sid} from DB for user {user_id}")
                    supabase.table("profiles").update({
                        "subaccount_sid": None,
                        "subaccount_auth_token": None,
                        "subaccount_status": "inactive"
                    }).eq("id", user_id).execute()
                    
                    # Also invalidate cache
                    cache.delete(f"user:{user_id}:profile")
                    
                    result = SubaccountStatusResponse(
                        has_subaccount=False,
                        subaccount=None,
                        phone_count=0
                    )
            except Exception as twilio_err:
                print(f"DEBUG: Twilio error fetching subaccount {subaccount_sid}: {twilio_err}")
                
                # Check if it's a 404 (Account not found)
                if "404" in str(twilio_err) or "not found" in str(twilio_err).lower():
                    print(f"DEBUG: Subaccount {subaccount_sid} not found in Twilio. Clearing from DB.")
                    supabase.table("profiles").update({
                        "subaccount_sid": None,
                        "subaccount_auth_token": None,
                        "subaccount_status": "inactive"
                    }).eq("id", user_id).execute()
                    cache.delete(f"user:{user_id}:profile")
                    
                    result = SubaccountStatusResponse(
                        has_subaccount=False,
                        subaccount=None,
                        phone_count=0
                    )
                else:
                    # Other Twilio error (e.g. timeout) - Fallback to DB info
                    result = SubaccountStatusResponse(
                        has_subaccount=True,
                        subaccount=SubaccountResponse(
                            sid=subaccount_sid,
                            friendly_name="Business Account",
                            status=subaccount_status_in_db or "active",
                            date_created="unknown"
                        ),
                        phone_count=0
                    )
        
        # Cache for 5 minutes
        cache.set(cache_key, result, ttl=300)
        
        return result

    except Exception as e:
        print(f"Error getting subaccount status: {e}")
        # Return a meaningful error instead of just 500
        raise HTTPException(
            status_code=500, 
            detail=f"Error checking subaccount status: {str(e)}"
        )

@router.delete("/subaccounts")
async def close_subaccount(
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
    cache: CacheService = Depends(get_cache_service),
    service: TwilioSubaccountService = Depends(get_subaccount_service)
):
    """
    Close (suspend) the user's subaccount.
    Warning: This will affect all phone numbers associated with the subaccount.
    """
    try:
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        supabase = create_client(settings.supabase_url, key)
        
        # Get subaccount info
        profile = supabase.table("profiles").select("subaccount_sid").eq("id", current_user.user_id).execute()
        
        if not profile.data or not profile.data[0].get("subaccount_sid"):
            raise HTTPException(status_code=404, detail="No subaccount found for this user")
        
        subaccount_sid = profile.data[0]["subaccount_sid"]
        
        # Close in Twilio
        success = service.close_subaccount(subaccount_sid)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to close subaccount in Twilio")
        
        # Update database
        supabase.table("profiles").update({
            "subaccount_status": "closed"
        }).eq("id", current_user.user_id).execute()
        
        # Invalidate caches
        cache.delete(f"user:{current_user.user_id}:subaccount")
        cache.delete(f"user:{current_user.user_id}:profile")
        cache.delete(f"user:{current_user.user_id}:phone_numbers")
        
        return {"success": True, "message": "Subaccount closed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error closing subaccount: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subaccounts/suspend")
async def suspend_subaccount(
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
    cache: CacheService = Depends(get_cache_service),
    service: TwilioSubaccountService = Depends(get_subaccount_service)
):
    """
    Temporarily suspend the user's subaccount.
    """
    try:
        key = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        supabase = create_client(settings.supabase_url, key)
        
        # Get subaccount info
        profile = supabase.table("profiles").select("subaccount_sid").eq("id", current_user.user_id).execute()
        
        if not profile.data or not profile.data[0].get("subaccount_sid"):
            raise HTTPException(status_code=404, detail="No subaccount found for this user")
        
        subaccount_sid = profile.data[0]["subaccount_sid"]
        
        # Suspend in Twilio
        success = service.suspend_subaccount(subaccount_sid)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to suspend subaccount")
        
        # Update database
        supabase.table("profiles").update({
            "subaccount_status": "suspended"
        }).eq("id", current_user.user_id).execute()
        
        # Invalidate caches
        cache.delete(f"user:{current_user.user_id}:subaccount")
        cache.delete(f"user:{current_user.user_id}:profile")
        
        return {"success": True, "message": "Subaccount suspended successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error suspending subaccount: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subaccounts/activate")
async def activate_subaccount(
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
    cache: CacheService = Depends(get_cache_service),
    service: TwilioSubaccountService = Depends(get_subaccount_service)
):
    """
    Reactivate a suspended subaccount.
    """
    try:
        key = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        supabase = create_client(settings.supabase_url, key)
        
        # Get subaccount info
        profile = supabase.table("profiles").select("subaccount_sid").eq("id", current_user.user_id).execute()
        
        if not profile.data or not profile.data[0].get("subaccount_sid"):
            raise HTTPException(status_code=404, detail="No subaccount found for this user")
        
        subaccount_sid = profile.data[0]["subaccount_sid"]
        
        # Activate in Twilio
        success = service.activate_subaccount(subaccount_sid)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to activate subaccount")
        
        # Update database
        supabase.table("profiles").update({
            "subaccount_status": "active"
        }).eq("id", current_user.user_id).execute()
        
        # Invalidate caches
        cache.delete(f"user:{current_user.user_id}:subaccount")
        cache.delete(f"user:{current_user.user_id}:profile")
        
        return {"success": True, "message": "Subaccount activated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error activating subaccount: {e}")
        raise HTTPException(status_code=500, detail=str(e))

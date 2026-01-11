
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from app.core.config import get_settings, Settings
from app.middleware.auth import get_current_user, AuthenticatedUser
from app.schemas.voice_settings import Voice, VoiceListResponse, VoiceSettings, VoiceSettingsResponse, VoiceSettingsUpdate
from app.api.dependencies import get_cache_service
from app.services.cache_service import CacheService
from supabase import create_client, Client

router = APIRouter()

def get_supabase(settings: Settings = Depends(get_settings)) -> Client:
    # Use service key to bypass RLS if needed, or anon key if RLS is set up for users
    # Here we use service key for simplicity in backend logic, but ensure user_id checks
    key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
    key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
    return create_client(settings.supabase_url, key)

@router.get("/voices", response_model=VoiceListResponse)
async def get_voices(
    settings: Settings = Depends(get_settings),
    supabase: Client = Depends(get_supabase),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Get all active available AI voices.
    Uses Redis caching with 30 minute TTL.
    """
    cache_key = "voices:active"
    
    try:
        # Try to get from cache first
        cached_voices = cache.get(cache_key, model=VoiceListResponse)
        if cached_voices:
            return cached_voices
        
        # Fetch from Supabase if not in cache
        response = supabase.table("voices").select("*").eq("is_active", True).execute()
        result = VoiceListResponse(data=response.data, count=len(response.data))
        
        # Cache for 30 minutes (1800 seconds) - voices rarely change
        cache.set(cache_key, result, ttl=1800)
        
        return result
    except Exception as e:
        print(f"Error fetching voices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch voices")

@router.get("/voice-settings", response_model=VoiceSettings)
async def get_my_voice_settings(
    current_user: AuthenticatedUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Get voice settings for the current user.
    Creates default settings if they don't exist.
    Uses Redis caching for better performance.
    """
    user_id = current_user.user_id
    cache_key = f"voice_settings:{user_id}"
    
    try:
        # 1. Try to get from cache first
        cached_settings = cache.get(cache_key, model=VoiceSettings)
        if cached_settings:
            return cached_settings
        
        # 2. Try to get existing settings from Supabase
        response = supabase.table("voice_settings").select("*, voice:voices(*)").eq("user_id", user_id).execute()

        if response.data and len(response.data) > 0:
            # Cache the result for 5 minutes (300 seconds) - settings can change
            cache.set(cache_key, response.data[0], ttl=300)
            return response.data[0]
            
        # 3. If not found, create default settings
        # First, pick a default voice (e.g., first available)
        voice_resp = supabase.table("voices").select("id, name").eq("is_active", True).limit(1).execute()
        
        default_voice_id = None
        default_model_name = None
        
        if voice_resp.data:
            default_voice_id = voice_resp.data[0]["id"]
            default_model_name = voice_resp.data[0].get("name")
        
        new_settings = {
            "user_id": user_id,
            "voice_id": default_voice_id,
            "model_name": default_model_name,
            "speaking_speed": 1.0,
            "conversation_tone": "friendly",
            "language": "en-US",
            "is_active": True
        }
        
        supabase.table("voice_settings").insert(new_settings).execute()
        
        # Fetch created record
        insert_resp = supabase.table("voice_settings").select("*, voice:voices(*)").eq("user_id", user_id).execute()
        
        if insert_resp.data:
            # Cache the newly created settings - 5 minutes
            cache.set(cache_key, insert_resp.data[0], ttl=300)
            return insert_resp.data[0]
            
        raise HTTPException(status_code=500, detail="Failed to create default voice settings")
        
    except Exception as e:
        print(f"Error fetching/creating voice settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/voice-settings", response_model=VoiceSettings)
async def update_voice_settings(
    update_data: VoiceSettingsUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Update voice settings for the current user.
    Invalidates Redis cache after update.
    """
    user_id = current_user.user_id
    cache_key = f"voice_settings:{user_id}"
    
    try:
        # Clean update data (remove None and empty string values)
        updates = {}
        for k, v in update_data.model_dump().items():
            if v is not None and v != "":
                if k == "voice_id":
                    # If we're updating voice_id, also try to fetch the name for model_name
                    updates["voice_id"] = v
                    try:
                        voice_resp = supabase.table("voices").select("name").eq("id", v).execute()
                        if voice_resp.data:
                            updates["model_name"] = voice_resp.data[0]["name"]
                    except Exception as e:
                        print(f"⚠️ Warning: Could not fetch model_name for voice_id {v}: {e}")
                else:
                    updates[k] = v

        print(f"🔧 UPDATE DEBUG: Received update_data: {update_data.model_dump()}")
        print(f"🔧 UPDATE DEBUG: Processed updates: {updates}")

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        updates["updated_at"] = "now()"
        
        # Update
        # Standard: table().update({...}).eq(...).execute()
        # In newer supabase-py versions, update() might behave differently regarding return values.
        # Let's try splitting it.
        
        supabase.table("voice_settings").update(updates).eq("user_id", user_id).execute()
        
        # Invalidate cache after update
        cache.delete(cache_key)
        
        # Fetch updated record separately to avoid chaining issues
        response = supabase.table("voice_settings").select("*, voice:voices(*)").eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            # Cache the updated settings - 5 minutes
            cache.set(cache_key, response.data[0], ttl=300)
            return response.data[0]
            
        raise HTTPException(status_code=404, detail="Voice settings not found")
        
    except Exception as e:
        print(f"Error updating voice settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/voice-settings/cache")
async def clear_voice_settings_cache(
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Clear cached voice settings for the current user.
    Useful for forcing a refresh of settings.
    """
    user_id = current_user.user_id
    cache_key = f"voice_settings:{user_id}"
    
    try:
        cache.delete(cache_key)
        return {"message": "Cache cleared successfully", "user_id": str(user_id)}
    except Exception as e:
        print(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear cache")

@router.post("/voice-settings/cache/reload")
async def reload_voice_settings(
    current_user: AuthenticatedUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Force reload voice settings from database and update cache.
    """
    user_id = current_user.user_id
    cache_key = f"voice_settings:{user_id}"
    
    try:
        # Fetch from database
        response = supabase.table("voice_settings").select("*, voice:voices(*)").eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            # Update cache with fresh data - 5 minutes
            cache.set(cache_key, response.data[0], ttl=300)
            return {"message": "Settings reloaded successfully", "data": response.data[0]}
        
        raise HTTPException(status_code=404, detail="Voice settings not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error reloading voice settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to reload settings")

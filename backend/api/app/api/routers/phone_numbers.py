from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.twilio_phone_service import TwilioPhoneService
from app.services.twilio_subaccount_service import TwilioSubaccountService
from app.services.email_service import EmailService
from app.core.config import get_settings, Settings
from app.middleware.auth import get_current_user, AuthenticatedUser
from app.api.dependencies import get_cache_service
from app.services.cache_service import CacheService
from supabase import create_client

router = APIRouter()

class PhoneNumberSearchRequest(BaseModel):
    location: str
    country: str = "US"
    state: str | None = None
    type_filter: str = "local"  # "local", "tollfree", "vanity"
    limit: int = 10

class PhoneNumberResponse(BaseModel):
    id: Optional[str] = None
    number: str
    phone_number: str
    location: str
    type: str
    monthly_cost: float
    capabilities: Optional[Dict[str, Any]] = {"voice": True, "sms": True}
    area_code: Optional[str] = None
    badge: Optional[str] = None
    status: str = "inactive"

    class Config:
        extra = "ignore"

class UpdatePhoneNumberStatusRequest(BaseModel):
    status: str

class UpdatePhoneNumberRequest(BaseModel):
    friendly_name: Optional[str] = None

class PhoneNumberSearchResponse(BaseModel):
    numbers: List[PhoneNumberResponse]
    total_available: int
    location: str
    type_filter: str

class PurchaseNumberRequest(BaseModel):
    phone_number: str

class ImportNumberRequest(BaseModel):
    phone_number: str
    carrier: str
    friendly_name: Optional[str] = None

class PurchaseNumberResponse(BaseModel):
    success: bool
    sid: Optional[str] = None
    phone_number: Optional[str] = None
    friendly_name: Optional[str] = None
    error: Optional[str] = None

def get_twilio_service():
    """Dependency to get Twilio phone service"""
    return TwilioPhoneService()

def get_subaccount_service():
    """Dependency to get subaccount service"""
    return TwilioSubaccountService()

@router.post("/phone-numbers/search", response_model=PhoneNumberSearchResponse)
async def search_phone_numbers(
    request: PhoneNumberSearchRequest,
    service: TwilioPhoneService = Depends(get_twilio_service)
):
    """
    Search for available phone numbers based on location and type.
    """
    try:
        # Search for numbers
        available_numbers = service.search_available_numbers(
            location=request.location,
            type_filter=request.type_filter,
            limit=request.limit
        )

        # Format response
        numbers = []
        for num in available_numbers:
            # Add "Best Match" badge to first result
            badge = "Best Match" if len(numbers) == 0 else None

            numbers.append(PhoneNumberResponse(
                number=num["number"],
                phone_number=num["phone_number"],
                location=num["location"],
                type=num["type"],
                monthly_cost=num["monthly_cost"],
                capabilities=num["capabilities"],
                area_code=num.get("area_code"),
                badge=badge
            ))

        return PhoneNumberSearchResponse(
            numbers=numbers,
            total_available=len(numbers),
            location=request.location,
            type_filter=request.type_filter
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching phone numbers: {str(e)}")

@router.get("/phone-numbers", response_model=List[PhoneNumberResponse])
async def get_my_numbers(
    settings: Settings = Depends(get_settings),
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Get all active phone numbers for the current user.
    """
    try:
        user_id = current_user.user_id
        cache_key = f"user:{user_id}:phone_numbers"
        sync_attempted = False
        
        # 1. Try Cache
        cached_numbers = cache.get(cache_key, model=PhoneNumberResponse, is_list=True)
        if cached_numbers is not None:
            print(f"CACHE HIT: {cache_key}")
            return cached_numbers
        
        print(f"CACHE MISS: {cache_key}")

        # Use service key to bypass RLS for selects
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        
        # DEBUG: Check which key is being used
        is_service_key = key_obj == settings.supabase_service_key
        # print(f"DEBUG: fetching numbers. Using Service Key? {is_service_key}")
        
        supabase = create_client(settings.supabase_url, key)
        
        # Explicitly log the user validation
        # print(f"DEBUG: Authenticated request for User ID: {user_id}")
        
        # Query strictly for this user's numbers
        response = supabase.table("phone_numbers").select("*").eq("user_id", user_id).execute()
        
        # Log the result with clarity to distinguish between 'users' and 'numbers'
        # print(f"DEBUG: Database query returned {len(response.data)} phone number records for User {user_id}")
        
        numbers = []
        if response.data and len(response.data) > 0:
            for record in response.data:
                # Determine badge based on status
                badge = "Active" if record.get("status") == "active" else "Inactive"
                
                numbers.append(PhoneNumberResponse(
                    id=record.get("id"),
                    number=record.get("friendly_name") or record.get("phone_number"),
                    phone_number=record.get("phone_number"),
                    location="US", # Default or store in DB
                    type="local", # Default or store in DB
                    monthly_cost=1.15, # Default cost
                    capabilities=record.get("capabilities", {"voice": True, "sms": True}),
                    area_code=record.get("phone_number")[2:5] if record.get("phone_number") and len(record.get("phone_number")) > 5 else None,
                    badge=badge,
                    status=record.get("status", "inactive")
                ))
        else:
            # DB is empty, check if we should sync from Twilio subaccount
            print(f"DEBUG: No numbers in DB for user {user_id}. Checking Twilio...")
            try:
                # Get subaccount info from profile
                profile = supabase.table("profiles").select("subaccount_sid, subaccount_auth_token").eq("id", user_id).execute()
                if profile.data and profile.data[0].get("subaccount_sid"):
                    sub_sid = profile.data[0]["subaccount_sid"]
                    sub_token = profile.data[0].get("subaccount_auth_token")
                    
                    if sub_sid and sub_token:
                        sync_attempted = True
                        from app.services.twilio_subaccount_service import TwilioSubaccountService
                        sub_service = TwilioSubaccountService()
                        sub_client = sub_service.get_subaccount_client(sub_sid, sub_token)
                        
                        if sub_client:
                            twilio_nums = sub_client.incoming_phone_numbers.list()
                            print(f"DEBUG: Found {len(twilio_nums)} numbers in Twilio subaccount {sub_sid}")
                            
                            for t_num in twilio_nums:
                                # Auto-import to DB for next time
                                new_num_data = {
                                    "user_id": user_id,
                                    "phone_number": t_num.phone_number,
                                    "friendly_name": t_num.friendly_name or t_num.phone_number,
                                    "sid": t_num.sid,
                                    "subaccount_sid": sub_sid,
                                    "status": "inactive",
                                    "capabilities": {"voice": True, "sms": True}
                                }
                                try:
                                    supabase.table("phone_numbers").insert(new_num_data).execute()
                                except Exception as e:
                                    print(f"DEBUG: Error inserting synced number {t_num.phone_number}: {e}")
                                    
                                numbers.append(PhoneNumberResponse(
                                    number=t_num.friendly_name or t_num.phone_number,
                                    phone_number=t_num.phone_number,
                                    location="US",
                                    type="local",
                                    monthly_cost=1.15,
                                    capabilities={"voice": True, "sms": True},
                                    area_code=t_num.phone_number[2:5] if len(t_num.phone_number) > 5 else None,
                                    badge="Inactive",
                                    status="inactive"
                                ))
            except Exception as sync_err:
                print(f"DEBUG: Error syncing numbers from Twilio: {sync_err}")
                # If sync failed, we return empty but don't cache
                if sync_attempted:
                    return []
            
        # 3. Cache and Return
        # Only cache if we either found numbers or we didn't even attempt sync (no subaccount)
        if numbers or not sync_attempted:
            cache.set(cache_key, numbers, ttl=300)
        
        return numbers
    except Exception as e:
        print(f"Error fetching numbers: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching phone numbers: {str(e)}")

@router.patch("/phone-numbers/{phone_id}/status")
async def update_phone_number_status(
    phone_id: str,
    request: UpdatePhoneNumberStatusRequest,
    settings: Settings = Depends(get_settings),
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Update the status of a phone number.
    Enforces that only one number can be active at a time.
    """
    try:
        # Use service key to bypass RLS
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        supabase = create_client(settings.supabase_url, key)
        
        user_id = current_user.user_id
        
        new_status = request.status.lower()
        if new_status not in ["active", "inactive"]:
             raise HTTPException(status_code=400, detail="Status must be 'active' or 'inactive'")

        if new_status == "active":
            # 1. Set all other numbers for this user to inactive
            supabase.table("phone_numbers").update({"status": "inactive"}).eq("user_id", user_id).execute()
            
            # 2. Set the requested number to active
            result = supabase.table("phone_numbers").update({"status": "active"}).eq("id", phone_id).eq("user_id", user_id).execute()
        else:
            # Just set this number to inactive
            result = supabase.table("phone_numbers").update({"status": "inactive"}).eq("id", phone_id).eq("user_id", user_id).execute()
            
        if not result.data:
            raise HTTPException(status_code=404, detail="Phone number not found")
        
        # Invalidate Cache
        cache.delete(f"user:{user_id}:phone_numbers")
            
        return {"success": True, "status": new_status}

    except Exception as e:
        print(f"Error updating status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/phone-numbers/{phone_id}")
async def update_phone_number(
    phone_id: str,
    request: UpdatePhoneNumberRequest,
    settings: Settings = Depends(get_settings),
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Update phone number details (e.g. friendly name).
    """
    try:
        # Use service key to bypass RLS
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        supabase = create_client(settings.supabase_url, key)
        
        user_id = current_user.user_id
        
        updates = {}
        if request.friendly_name is not None:
            updates["friendly_name"] = request.friendly_name
            
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        result = supabase.table("phone_numbers").update(updates).eq("id", phone_id).eq("user_id", user_id).execute()
            
        if not result.data:
            raise HTTPException(status_code=404, detail="Phone number not found")
        
        # Invalidate Cache
        cache.delete(f"user:{user_id}:phone_numbers")
            
        return {"success": True, "data": result.data[0]}

    except Exception as e:
        print(f"Error updating phone number: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/phone-numbers/import", response_model=PurchaseNumberResponse)
async def import_phone_number(
    request: ImportNumberRequest,
    settings: Settings = Depends(get_settings),
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Import an existing phone number manually to the database.
    """
    try:
        # Use service key to bypass RLS for inserts
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        supabase = create_client(settings.supabase_url, key)
        
        user_id = current_user.user_id
        
        # Check if number already exists
        existing = supabase.table("phone_numbers").select("*").eq("phone_number", request.phone_number).execute()
        if existing.data and len(existing.data) > 0:
             # Just return success if it's already there
             return PurchaseNumberResponse(
                success=True,
                phone_number=request.phone_number,
                friendly_name=existing.data[0].get("friendly_name"),
                sid=existing.data[0].get("sid")
            )

        new_number = {
            "user_id": user_id,
            "phone_number": request.phone_number,
            "friendly_name": request.friendly_name or request.phone_number,
            "sid": f"imported_{request.phone_number[-4:]}", 
            "status": "inactive",
            "capabilities": {"voice": True, "sms": True, "imported": True, "carrier": request.carrier}
        }
        
        result = supabase.table("phone_numbers").insert(new_number).execute()
        print(f"Imported number to DB: {request.phone_number}")
        
        # Invalidate Cache
        cache.delete(f"user:{user_id}:phone_numbers")
        
        return PurchaseNumberResponse(
            success=True,
            phone_number=request.phone_number,
            friendly_name=new_number["friendly_name"],
            sid=new_number["sid"]
        )

    except Exception as e:
        print(f"Error importing number: {e}")
        return PurchaseNumberResponse(success=False, error=str(e))

@router.post("/phone-numbers/purchase", response_model=PurchaseNumberResponse)
async def purchase_phone_number(
    request: Request,
    purchase_req: PurchaseNumberRequest,
    service: TwilioPhoneService = Depends(get_twilio_service),
    subaccount_service: TwilioSubaccountService = Depends(get_subaccount_service),
    settings: Settings = Depends(get_settings),
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """
    Purchase a phone number from Twilio and save to database.
    Automatically creates and uses subaccount for isolation.
    """
    try:
        # 1. Check if user has a subaccount
        key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
        key = key_obj.get_secret_value() if hasattr(key_obj, "get_secret_value") else key_obj
        supabase = create_client(settings.supabase_url, key)
        
        profile = supabase.table("profiles").select(
            "subaccount_sid, subaccount_auth_token, subaccount_status"
        ).eq("id", current_user.user_id).execute()
        
        if not profile.data or not profile.data[0].get("subaccount_sid"):
            return PurchaseNumberResponse(
                success=False,
                error="Please set up your business account first. Go to /dashboard/voice-setup/setup-subaccount"
            )
        
        subaccount_sid = profile.data[0]["subaccount_sid"]
        subaccount_auth_token = profile.data[0]["subaccount_auth_token"]
        
        # Construct the Webhook URL
        base_url = str(request.base_url).rstrip("/")
        webhook_url = f"{base_url}/api/twilio/incoming-call"
        print(f"Configuring Voice URL to: {webhook_url}")
        
        # 2. Purchase number on main account
        result = service.purchase_number(purchase_req.phone_number, webhook_url=webhook_url)
        
        if not result:
            return PurchaseNumberResponse(success=False, error="Failed to purchase number via Twilio service")
        
        # 3. Transfer number to subaccount
        phone_sid = result.get("sid")
        if phone_sid and subaccount_sid:
            transfer_success = subaccount_service.transfer_number_to_subaccount(phone_sid, subaccount_sid)
            if not transfer_success:
                print(f"Warning: Failed to transfer number to subaccount, but purchase succeeded")
            else:
                print(f"Successfully transferred number to subaccount {subaccount_sid}")
        
        # 4. Save to DB
        try:
            user_id = current_user.user_id
            
            new_number = {
                "user_id": user_id,
                "phone_number": result.get("phone_number"),
                "friendly_name": result.get("friendly_name", result.get("phone_number")),
                "sid": result.get("sid"),
                "subaccount_sid": subaccount_sid,
                "status": "inactive",
                "capabilities": {"voice": True, "sms": True}
            }
            supabase.table("phone_numbers").insert(new_number).execute()
            print(f"Saved new number to DB: {result.get('phone_number')}")
            
            # Invalidate Cache
            cache.delete(f"user:{user_id}:phone_numbers")

        except Exception as db_err:
            print(f"Error saving number to DB: {db_err}")
            if hasattr(db_err, 'details'):
                print(f"DB Error Details: {db_err.details}")
            if hasattr(db_err, 'message'):
                print(f"DB Error Message: {db_err.message}")

        return PurchaseNumberResponse(
            success=True,
            sid=result.get("sid"),
            phone_number=result.get("phone_number"),
            friendly_name=result.get("friendly_name")
        )

    except Exception as e:
        print(f"Error purchasing number: {e}")
        return PurchaseNumberResponse(success=False, error=str(e))

@router.get("/phone-numbers/purchased")
async def get_purchased_numbers(
    service: TwilioPhoneService = Depends(get_twilio_service)
):
    """
    Get all purchased phone numbers for the account.
    """
    try:
        numbers = service.get_purchased_numbers()
        return {"numbers": numbers, "total": len(numbers)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting purchased numbers: {str(e)}")

@router.get("/phone-numbers/capabilities")
async def get_twilio_capabilities():
    """
    Get Twilio API capabilities and status.
    """
    settings = get_settings()
    service = TwilioPhoneService()

    return {
        "twilio_configured": bool(settings.twilio_account_sid and settings.twilio_auth_token),
        "account_sid": bool(settings.twilio_account_sid),
        "auth_token": bool(settings.twilio_auth_token),
        "service_available": service.client is not None
    }
from fastapi import APIRouter, HTTPException, Depends, status, Header
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import jwt
import asyncio
import json
import redis
from supabase import create_client, Client
from app.services.email_service import EmailService
from app.services.supabase_service import SupabaseService
from app.middleware.auth import get_current_user, AuthenticatedUser
from app.api.dependencies import get_cache_service
from app.services.cache_service import CacheService

# Day of week mapping
DAY_TO_INT = {
    "sunday": 0,
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5,
    "saturday": 6,
}
INT_TO_DAY = {v: k for k, v in DAY_TO_INT.items()}

# Simple models
class BusinessDetails(BaseModel):
    business_name: str = ""
    category: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    description: Optional[str] = ""
    email: Optional[str] = ""
    timezone: Optional[str] = "America/New_York"

class BusinessHour(BaseModel):
    id: Optional[str] = None
    day_of_week: str
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    enabled: bool = True

class Service(BaseModel):
    id: Optional[str] = None
    name: str
    price: Optional[float] = None
    description: Optional[str] = None

class UrgentCallRule(BaseModel):
    id: Optional[str] = None
    condition_text: str
    action: str
    contact: Optional[str] = None

class BookingRequirement(BaseModel):
    id: Optional[str] = None
    field_name: str
    description: Optional[str] = None
    required: bool = True
    field_type: str
    status: Optional[str] = None  # 'optional', 'recommended', 'required'

class NotificationSettings(BaseModel):
    id: Optional[str] = None
    urgent_call_alerts: bool = True
    booking_confirmations: bool = True
    missed_call_alerts: bool = True
    transfer_number: Optional[str] = None
    standard_transfer_number: Optional[str] = None

class BusinessSetupRequest(BaseModel):
    business: BusinessDetails
    business_hours: Optional[List[BusinessHour]] = []
    services: Optional[List[Service]] = []
    urgent_call_rules: Optional[List[UrgentCallRule]] = []
    notification_settings: Optional[NotificationSettings] = None
    booking_requirements: Optional[List[BookingRequirement]] = []

class BusinessSetupResponse(BaseModel):
    business: BusinessDetails
    business_hours: List[BusinessHour]
    services: List[Service]
    urgent_call_rules: List[UrgentCallRule]
    notification_settings: Optional[NotificationSettings] = None
    booking_requirements: List[BookingRequirement]

from starlette.requests import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

from app.core.config import get_settings, Settings

def get_supabase_client() -> Client:
    settings = get_settings()
    supabase_url = settings.supabase_url
    # Use service key if available, otherwise use anon key
    key_obj = settings.supabase_service_key if settings.supabase_service_key else settings.supabase_key
    
    if not supabase_url or not key_obj:
        print("❌ Supabase credentials not provided")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database configuration missing"
        )

    try:
        supabase_key = key_obj.get_secret_value()
        client = create_client(supabase_url, supabase_key)
        return client
    except Exception as e:
        print(f"❌ Supabase client creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )


@router.get("/business-setup", response_model=BusinessSetupResponse)
async def get_business_setup(
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """Get complete business setup for current user"""
    try:
        user_id = current_user.user_id
        if not user_id:
            print("❌ User ID missing in current_user")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        # Try cache first
        cache_key = f"business_setup:{user_id}"
        print(f"🔍 Cache key: {cache_key}")
        try:
            cached_data = cache.get(cache_key, model=BusinessSetupResponse)
            if cached_data:
                print(f"✅ Cache HIT for {user_id} - returning cached data with {len(cached_data.booking_requirements)} requirements")
                return cached_data
        except Exception as cache_err:
            print(f"⚠️ Cache read error (ignoring): {cache_err}")

        supabase = get_supabase_client()

        try:
            print(f"🔍 Querying Supabase for user_id: {user_id}")
            response = supabase.table('businesses').select('*').eq('user_id', user_id).execute()
            businesses = response.data  # type: ignore

            if businesses and len(businesses) > 0:
                business_data = businesses[0]
                print(f"✅ Found business in database: {business_data.get('business_name')}")
                business_id = business_data['id']

                # Get related data
                service = SupabaseService()

                # Fetch data in parallel for better performance
                print(f"🔍 Fetching related data for business_id: {business_id}")
                
                async def safe_execute(table_name, bus_id):
                    try:
                        res = await asyncio.to_thread(lambda: supabase.table(table_name).select('*').eq('business_id', bus_id).execute())
                        return res.data or []
                    except Exception as e:
                        print(f"⚠️ Error fetching from {table_name}: {e}")
                        return []

                business_hours_task = service.get_business_hours(business_id)
                services_task = safe_execute('services', business_id)
                rules_task = safe_execute('urgent_call_rules', business_id)
                reqs_task = service.get_booking_requirements(business_id)
                notif_task = safe_execute('notification_settings', business_id)

                # Wait for all tasks to complete
                results = await asyncio.gather(
                    business_hours_task,
                    services_task,
                    rules_task,
                    reqs_task,
                    notif_task
                )

                business_hours_data = results[0]
                services_data = results[1]
                rules_data = results[2]
                reqs_data = results[3]
                notif_data = results[4]

                print(f"📦 Data retrieved: hours={len(business_hours_data)}, services={len(services_data)}, rules={len(rules_data)}, reqs={len(reqs_data)}, notifs={len(notif_data)}")

                # Map to Pydantic models with error handling
                try:
                    # Clean up business data to match BusinessDetails
                    business_details = BusinessDetails(
                        business_name=business_data.get('business_name') or '',
                        category=business_data.get('category') or '',
                        phone=business_data.get('phone') or '',
                        address=business_data.get('address') or '',
                        description=business_data.get('description') or '',
                        email=business_data.get('email') or '',
                        timezone=business_data.get('timezone') or 'America/New_York'
                    )

                    # Safe mapping for services
                    safe_services = []
                    for s in services_data:
                        try:
                            if isinstance(s, dict) and s.get('name'):
                                safe_services.append(Service(
                                    id=str(s.get('id', '')),
                                    name=str(s.get('name', '')),
                                    price=float(s.get('price')) if s.get('price') is not None else None,
                                    description=s.get('description')
                                ))
                        except Exception as e:
                            print(f"⚠️ Error mapping service: {e}, data: {s}")

                    # Safe mapping for rules
                    safe_rules = []
                    for r in rules_data:
                        try:
                            if isinstance(r, dict) and r.get('condition_text') and r.get('action'):
                                safe_rules.append(UrgentCallRule(
                                    id=str(r.get('id', '')),
                                    condition_text=str(r.get('condition_text', '')),
                                    action=str(r.get('action', '')),
                                    contact=r.get('contact')
                                ))
                        except Exception as e:
                            print(f"⚠️ Error mapping rule: {e}, data: {r}")

                    # Safe mapping for requirements
                    safe_reqs = []
                    for req in reqs_data:
                        try:
                            if isinstance(req, dict) and req.get('field_name'):
                                safe_reqs.append(BookingRequirement(
                                    id=str(req.get('id', '')),
                                    field_name=str(req.get('field_name', '')),
                                    description=req.get('description'),
                                    required=bool(req.get('required', True)),
                                    field_type=str(req.get('field_type', 'text')),
                                    status=req.get('status')
                                ))
                        except Exception as e:
                            print(f"⚠️ Error mapping requirement: {e}, data: {req}")

                    # Map business hours
                    safe_hours = []
                    for h in business_hours_data:
                        try:
                            if isinstance(h, dict) and h.get('day_of_week'):
                                safe_hours.append(BusinessHour(
                                    id=str(h.get('id', '')) if h.get('id') else None,
                                    day_of_week=str(h.get('day_of_week', '')),
                                    open_time=h.get('open_time'),
                                    close_time=h.get('close_time'),
                                    enabled=bool(h.get('enabled', True))
                                ))
                        except Exception as e:
                            print(f"⚠️ Error mapping business hour: {e}, data: {h}")

                    # Map notification settings
                    safe_notifs = None
                    if notif_data and len(notif_data) > 0:
                        try:
                            n = notif_data[0]
                            safe_notifs = NotificationSettings(
                                id=str(n.get('id', '')),
                                urgent_call_alerts=bool(n.get('urgent_call_alerts', True)),
                                booking_confirmations=bool(n.get('booking_confirmations', True)),
                                missed_call_alerts=bool(n.get('missed_call_alerts', True)),
                                transfer_number=n.get('transfer_number'),
                                standard_transfer_number=n.get('standard_transfer_number')
                            )
                        except Exception as e:
                            print(f"⚠️ Error mapping notification settings: {e}, data: {notif_data[0]}")

                    response_obj = BusinessSetupResponse(
                        business=business_details,
                        business_hours=safe_hours,
                        services=safe_services,
                        urgent_call_rules=safe_rules,
                        notification_settings=safe_notifs,
                        booking_requirements=safe_reqs
                    )
                    
                    # Cache the result
                    try:
                        cache.set(cache_key, response_obj, ttl=900)
                        print(f"💾 Cache SET for {cache_key}")
                    except Exception as cache_err:
                        print(f"⚠️ Cache write error: {cache_err}")

                    return response_obj
                except Exception as val_err:
                    print(f"❌ Validation error in response mapping: {val_err}")
                    import traceback
                    traceback.print_exc()
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data validation error: {str(val_err)}")
            else:
                print(f"⚠️ No business found for user {user_id}, returning default empty response")
                return BusinessSetupResponse(
                    business=BusinessDetails(business_name="", category="", phone="", address="", description=""),
                    business_hours=[],
                    services=[],
                    urgent_call_rules=[],
                    booking_requirements=[]
                )
        except Exception as e:
            print(f"❌ Supabase query error: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ General error in get_business_setup: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/booking-requirements")
async def get_booking_requirements(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Get only booking requirements for current user"""
    try:
        user_id = current_user.user_id
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        supabase = get_supabase_client()
        
        # Get user's business ID
        response = supabase.table('businesses').select('id').eq('user_id', user_id).execute()
        businesses = response.data
        
        if not businesses or len(businesses) == 0:
            print(f"⚠️ No business found for user {user_id} when fetching requirements")
            return {"data": []}
            
        business_id = businesses[0]['id']
        service = SupabaseService()
        requirements_data = await service.get_booking_requirements(business_id)
        
        # Safe mapping for requirements
        safe_reqs = []
        for req in (requirements_data or []):
            try:
                if isinstance(req, dict) and req.get('field_name'):
                    safe_reqs.append(BookingRequirement(
                        id=str(req.get('id', '')),
                        field_name=str(req.get('field_name', '')),
                        description=req.get('description'),
                        required=bool(req.get('required', True)),
                        field_type=str(req.get('field_type', 'text')),
                        status=req.get('status')
                    ))
            except Exception as e:
                print(f"⚠️ Error mapping requirement in endpoint: {e}, data: {req}")

        print(f"✅ Returning {len(safe_reqs)} safe booking requirements for user {user_id}")
        return {"data": safe_reqs}
    except Exception as e:
        print(f"❌ Error in get_booking_requirements: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/business-setup")
async def save_business_setup(
    business_setup: BusinessSetupRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """Save complete business setup"""
    try:
        user_id = current_user.user_id
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        setup_data = business_setup.dict()
        print(f"Full setup data received: {setup_data}")

        supabase = get_supabase_client()
        
        try:
            print(f"💾 Attempting database save for user_id: {user_id}")
            # Check if business exists
            existing_businesses = supabase.table('businesses').select('id').eq('user_id', user_id).execute()
            print(f"📊 Found {len(existing_businesses.data)} existing businesses for user")

            business_id = None
            if existing_businesses.data and len(existing_businesses.data) > 0:
                business_id = existing_businesses.data[0]['id']  # type: ignore
                print(f"📝 Updating existing business: {business_id}")
                # Update business
                supabase.table('businesses').update(setup_data['business']).eq('id', business_id).execute()
                print("✅ Business updated successfully")
            else:
                print("🆕 Creating new business in database")
                # Create new business
                business_data = {**setup_data['business'], 'user_id': user_id}
                print(f"📤 Inserting: {business_data}")
                new_business_response = supabase.table('businesses').insert(business_data).execute()
                if new_business_response.data:
                    business_id = new_business_response.data[0]['id']
                    print(f"✅ Created business with ID: {business_id}")

            if business_id:
                    print(f"💾 Saving related data for business: {business_id}")
                    # Save related data to Supabase
                    
                    async def update_section(table, data):
                        try:
                            print(f"📋 Updating {table} with {len(data) if data else 0} items")
                            await asyncio.to_thread(lambda: supabase.table(table).delete().eq('business_id', business_id).execute())
                            if data:
                                items_to_insert = []
                                for item in data:
                                    item_data = {**item, 'business_id': business_id}
                                    item_data.pop('id', None)
                                    items_to_insert.append(item_data)
                                print(f"   Prepared to insert: {len(items_to_insert)} items into {table}")
                                if items_to_insert:
                                    result = await asyncio.to_thread(lambda items=items_to_insert: supabase.table(table).insert(items).execute())
                                    print(f"   Insert result for {table}: {result.data if hasattr(result, 'data') else result}")
                                else:
                                    print(f"   No items to insert into {table}")
                            else:
                                print(f"   No data to save for {table}")
                        except Exception as e:
                            print(f"❌ Error updating {table}: {e}")
                            raise

                    # Prepare data
                    services_data = setup_data.get('services', [])
                    rules_data = setup_data.get('urgent_call_rules', [])
                    reqs_data = setup_data.get('booking_requirements', [])
                    notif_data = setup_data.get('notification_settings')

                    print(f"📊 Prepared data:")
                    print(f"   services_data: {len(services_data)} items")
                    print(f"   rules_data: {len(rules_data)} items")
                    print(f"   reqs_data: {len(reqs_data)} items")
                    print(f"   notif_data: {'Yes' if notif_data else 'No'}")
                    print(f"   business_id: {business_id} (type: {type(business_id)})")

                    # Execute updates in parallel
                    tasks = [
                        update_section('services', services_data),
                        update_section('urgent_call_rules', rules_data),
                        update_section('booking_requirements', reqs_data)
                    ]

                    # Special handling for notification_settings (it's a single record, not a list)
                    if notif_data:
                        async def update_notifications():
                            try:
                                print(f"📋 Updating notification_settings for business: {business_id}")
                                notif_record = {**notif_data, 'business_id': business_id}
                                notif_record.pop('id', None)
                                
                                # Check if settings exist
                                existing = await asyncio.to_thread(lambda: supabase.table('notification_settings').select('id').eq('business_id', business_id).execute())
                                if existing.data:
                                    await asyncio.to_thread(lambda: supabase.table('notification_settings').update(notif_record).eq('business_id', business_id).execute())
                                    print("   Updated existing notification settings")
                                else:
                                    await asyncio.to_thread(lambda: supabase.table('notification_settings').insert(notif_record).execute())
                                    print("   Inserted new notification settings")
                            except Exception as e:
                                print(f"❌ Error updating notification_settings: {e}")
                                raise

                        tasks.append(update_notifications())

                    if setup_data.get('business_hours'):
                         service = SupabaseService()
                         tasks.append(service.upsert_business_hours(business_id, setup_data['business_hours'])) # type: ignore

                    results = await asyncio.gather(*tasks, return_exceptions=True)

                    for i, result in enumerate(results):
                        if isinstance(result, Exception):
                            print(f"❌ Task {i} failed: {result}")
                            raise result

                    print("✅ Successfully saved to Supabase database")

                    # Send welcome email if business has email
                    business_email = setup_data['business'].get('email')
                    business_name = setup_data['business'].get('business_name', 'Business Owner')

                    if business_email:
                        try:
                            email_service = EmailService()
                            email_sent = email_service.send_business_welcome_email(business_email, business_name)
                            if email_sent:
                                print(f"📧 Welcome email sent to {business_email}")
                            else:
                                print(f"⚠️ Failed to send welcome email to {business_email}")
                        except Exception as email_error:
                            print(f"⚠️ Email service error: {email_error}")

                    # Invalidate cache BEFORE querying to get fresh data
                    cache_key = f"business_setup:{user_id}"
                    cache.delete(cache_key)
                    print(f"🧹 Cache invalidated for {cache_key}")

                    # Wait a tiny bit to ensure Redis delete completes
                    await asyncio.sleep(0.1)

                    return {"success": True, "business_id": business_id, "source": "database"}
            else:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create/update business record")

        except Exception as e:
            print(f"❌ Supabase save error: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database save error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Save error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/business-hours")
async def save_business_hours(
    business_hours: List[BusinessHour],
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """Save only business hours"""
    try:
        user_id = current_user.user_id
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        supabase = get_supabase_client()
        
        try:
            # Get user's business ID
            existing_businesses = supabase.table('businesses').select('id').eq('user_id', user_id).execute()
            
            if not existing_businesses.data:
                raise HTTPException(status_code=status.HTTP_404, detail="Business not found. Please complete business setup first.")
            
            business_id = existing_businesses.data[0]['id']
            
            # Use service to upsert hours
            service = SupabaseService()
            # Convert Pydantic models to dicts
            hours_data = [h.dict() for h in business_hours]
            await service.upsert_business_hours(business_id, hours_data)
            
            print("✅ Business hours saved to database successfully")

            # Invalidate cache
            cache_key = f"business_setup:{user_id}"
            cache.delete(cache_key)
            print(f"🧹 Cache invalidated for {cache_key}")

            return {"success": True, "message": "Business hours saved successfully", "source": "database"}
            
        except Exception as e:
            print(f"❌ Supabase save error for hours: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save business hours to database")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Save business hours error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/get-hours")
async def get_business_hours(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Get only business hours"""
    try:
        user_id = current_user.user_id
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        supabase = get_supabase_client()

        try:
            # Get user's business ID
            existing_businesses = supabase.table('businesses').select('id').eq('user_id', user_id).execute()

            if not existing_businesses.data:
                return {"business_hours": []}

            business_id = existing_businesses.data[0]['id']  # type: ignore

            # Get business hours
            service = SupabaseService()
            business_hours = await service.get_business_hours(business_id)
            return {"business_hours": business_hours}

        except Exception as e:
            print(f"❌ Supabase get error for hours: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    except Exception as e:
        print(f"Get business hours error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/notification-settings")
async def update_notification_settings(
    settings: NotificationSettings,
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """Save only notification settings"""
    try:
        user_id = current_user.user_id
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        supabase = get_supabase_client()

        try:
            # Get user's business ID
            existing_businesses = supabase.table('businesses').select('id').eq('user_id', user_id).execute()

            if not existing_businesses.data:
                raise HTTPException(status_code=status.HTTP_404, detail="Business not found. Please complete business setup first.")

            business_id = existing_businesses.data[0]['id']
            print(f"🔄 Updating notification settings for business_id: {business_id}")

            # Prepare data
            notif_record = settings.dict()
            notif_record.pop('id', None)
            notif_record['business_id'] = business_id

            # Check if settings exist
            existing = await asyncio.to_thread(lambda: supabase.table('notification_settings').select('id').eq('business_id', business_id).execute())
            
            if existing.data:
                await asyncio.to_thread(lambda: supabase.table('notification_settings').update(notif_record).eq('business_id', business_id).execute())
                print("   Updated existing notification settings")
            else:
                await asyncio.to_thread(lambda: supabase.table('notification_settings').insert(notif_record).execute())
                print("   Inserted new notification settings")

            # Invalidate cache
            cache_key = f"business_setup:{user_id}"
            cache.delete(cache_key)
            print(f"🧹 Cache invalidated for {cache_key}")

            return {"success": True, "message": "Notification settings saved successfully", "source": "database"}

        except Exception as e:
            print(f"❌ Supabase save error for notification settings: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        print(f"Save notification settings error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/booking-requirements")
async def update_booking_requirements(
    booking_requirements: List[BookingRequirement],
    current_user: AuthenticatedUser = Depends(get_current_user),
    cache: CacheService = Depends(get_cache_service)
):
    """Save only booking requirements"""
    try:
        user_id = current_user.user_id
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        supabase = get_supabase_client()

        try:
            # Get user's business ID
            existing_businesses = supabase.table('businesses').select('id').eq('user_id', user_id).execute()

            if not existing_businesses.data:
                raise HTTPException(status_code=status.HTTP_404, detail="Business not found. Please complete business setup first.")

            business_id = existing_businesses.data[0]['id']
            print(f"🔄 Updating booking requirements for business_id: {business_id} with {len(booking_requirements)} items")

            # Use service to upsert booking requirements
            service = SupabaseService()
            # Convert Pydantic models to dicts
            requirements_data = [r.dict() for r in booking_requirements]
            success = await service.upsert_booking_requirements(business_id, requirements_data)

            if success:
                print(f"✅ Booking requirements saved successfully ({len(requirements_data)} items)")

                # Verify the save by querying back
                verify_result = await service.get_booking_requirements(business_id)
                print(f"✅ Verification: Found {len(verify_result)} requirements in database")

                # Invalidate cache
                cache_key = f"business_setup:{user_id}"
                cache.delete(cache_key)
                print(f"🧹 Cache invalidated for {cache_key}")

                return {"success": True, "message": "Booking requirements saved successfully", "source": "database", "count": len(verify_result)}
            else:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save booking requirements")

        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Supabase save error for booking requirements: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        print(f"Save booking requirements error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


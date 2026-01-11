from supabase import create_client, Client
from typing import Dict, List, Any, Optional
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)


class SupabaseServiceError(Exception):
    """Custom exception for Supabase operations"""
    def __init__(self, message: str, operation: str, details: Optional[str] = None):
        self.message = message
        self.operation = operation
        self.details = details
        super().__init__(f"{operation}: {message}")


class SupabaseService:
    """
    Service for Supabase database operations with proper error handling.
    All methods return None/empty on error and log appropriately.
    """
    
    def __init__(self):
        settings = get_settings()
        # Use service key for backend operations to bypass RLS if needed
        key = settings.supabase_service_key.get_secret_value() if settings.supabase_service_key else settings.supabase_key.get_secret_value()
        self.client: Client = create_client(
            settings.supabase_url,
            key
        )
        self._settings = settings
    
    def _log_error(self, operation: str, error: Exception, context: Optional[str] = None) -> None:
        """Log database errors without exposing sensitive data"""
        error_type = type(error).__name__
        ctx = f" [{context}]" if context else ""
        # Don't log full error messages in production as they may contain data
        if self._settings.is_development:
            logger.error(f"DB {operation}{ctx}: {error_type}: {str(error)[:200]}")
        else:
            logger.error(f"DB {operation}{ctx}: {error_type}")

    async def get_business_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get business details for a user"""
        if not user_id:
            logger.warning("get_business_by_user_id called with empty user_id")
            return None
        try:
            result = self.client.table('businesses').select('*').eq('user_id', user_id).single().execute()
            if result.data:
                return dict(result.data)  # type: ignore
            return None
        except Exception as e:
            # single() throws if no results - that's expected, not an error
            if "No rows" in str(e) or "0 rows" in str(e):
                return None
            self._log_error("get_business_by_user_id", e)
            return None

    async def create_business(self, user_id: str, business_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new business"""
        if not user_id:
            logger.warning("create_business called with empty user_id")
            return None
        try:
            # Sanitize input - remove any fields that shouldn't be set directly
            safe_data = {k: v for k, v in business_data.items() if k not in ['id', 'created_at']}
            result = self.client.table('businesses').insert({
                'user_id': user_id,
                **safe_data
            }).execute()
            if result.data and len(result.data) > 0:
                logger.info(f"Business created for user")
                return dict(result.data[0])  # type: ignore
            return None
        except Exception as e:
            self._log_error("create_business", e)
            return None

    async def update_business(self, business_id: str, business_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update business details"""
        if not business_id:
            logger.warning("update_business called with empty business_id")
            return None
        try:
            # Sanitize input
            safe_data = {k: v for k, v in business_data.items() if k not in ['id', 'user_id', 'created_at']}
            result = self.client.table('businesses').update(safe_data).eq('id', business_id).execute()
            if result.data and len(result.data) > 0:
                return dict(result.data[0])  # type: ignore
            return None
        except Exception as e:
            self._log_error("update_business", e)
            return None

    async def get_business_hours(self, business_id: str) -> List[Dict[str, Any]]:
        """Get business hours for a business as a list of day objects"""
        try:
            # Try fetching all rows to support both Normalized and Denormalized schemas
            result = self.client.table('business_hours').select('*').eq('business_id', business_id).execute()
            rows = result.data
            
            if not rows:
                return []
            
            # Check if Normalized (multiple rows or has day_of_week column)
            # Normalized: One row per day
            if len(rows) > 1 or 'day_of_week' in rows[0]:
                 # Map normalized rows to expected format
                 # Ensure we return all 7 days even if DB has partial
                 db_hours = {r.get('day_of_week').lower(): r for r in rows if r.get('day_of_week')}
                 
                 days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                 hours_list = []
                 for day in days:
                     r = db_hours.get(day)
                     if r:
                         hours_list.append({
                             'day_of_week': day,
                             'open_time': r.get('open_time'),
                             'close_time': r.get('close_time'),
                             'enabled': r.get('enabled', True)
                         })
                     else:
                         # Default for missing day
                         hours_list.append({
                             'day_of_week': day,
                             'open_time': '09:00:00',
                             'close_time': '17:00:00',
                             'enabled': False
                         })
                 return hours_list
            
            # Denormalized: Single row with monday_open, etc.
            row = rows[0]
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            hours_list = []
            for day in days:
                hours_list.append({
                    'day_of_week': day,
                    'open_time': row.get(f'{day}_open'),
                    'close_time': row.get(f'{day}_close'),
                    'enabled': row.get(f'{day}_enabled', True if day not in ['saturday', 'sunday'] else False)
                })
            return hours_list
        except Exception as e:
            print(f"Error getting business hours: {e}")
            return []

    async def upsert_business_hours(self, business_id: str, hours_data: List[Dict[str, Any]]) -> bool:
        """Update business hours row for a business"""
        try:
            print(f"🔄 Upserting business hours for business_id: {business_id}")
            
            # Check existing data to determine schema
            existing = self.client.table('business_hours').select('*').eq('business_id', business_id).execute()
            rows = existing.data or []
            
            is_normalized = False
            if rows and ('day_of_week' in rows[0] or len(rows) > 1):
                is_normalized = True
            
            # If we detected Normalized schema, or if we want to default to it (optional strategy)
            # But let's stick to "Maintain existing if present"
            
            if is_normalized:
                print("🔄 Detected Normalized schema (multiple rows/day_of_week)")
                # Delete existing
                self.client.table('business_hours').delete().eq('business_id', business_id).execute()
                
                # Insert new
                new_rows = []
                for hour in hours_data:
                    new_rows.append({
                        'business_id': business_id,
                        'day_of_week': hour['day_of_week'],
                        'open_time': hour.get('open_time'),
                        'close_time': hour.get('close_time'),
                        'enabled': hour.get('enabled', True)
                    })
                
                result = self.client.table('business_hours').insert(new_rows).execute()
                print(f"✅ Normalized insert result: {result}")
                return True

            # Default / Denormalized Strategy
            print("� Using Denormalized strategy (single row)")
            update_data = {}
            for hour in hours_data:
                day = hour['day_of_week'].lower()
                update_data[f'{day}_open'] = hour.get('open_time')
                update_data[f'{day}_close'] = hour.get('close_time')
                update_data[f'{day}_enabled'] = hour.get('enabled', True)

            if rows:
                # Update existing
                result = self.client.table('business_hours').update(update_data).eq('business_id', business_id).execute()
            else:
                # Insert new
                update_data['business_id'] = business_id
                # Try Denormalized Insert
                try:
                    result = self.client.table('business_hours').insert(update_data).execute()
                except Exception as e:
                    print(f"⚠️ Denormalized insert failed ({e}), retrying with Normalized...")
                    # Fallback to Normalized Insert if Denormalized fails (e.g. missing columns)
                    new_rows = []
                    for hour in hours_data:
                        new_rows.append({
                            'business_id': business_id,
                            'day_of_week': hour['day_of_week'],
                            'open_time': hour.get('open_time'),
                            'close_time': hour.get('close_time'),
                            'enabled': hour.get('enabled', True)
                        })
                    result = self.client.table('business_hours').insert(new_rows).execute()

            success = bool(result.data)
            return success

        except Exception as e:
            print(f"❌ Upsert error: {e}")
            return False

    async def get_services(self, business_id: str) -> List[Dict[str, Any]]:
        """Get services for a business"""
        try:
            result = self.client.table('services').select('*').eq('business_id', business_id).execute()
            if result.data:
                return [dict(item) for item in result.data]
            return []
        except Exception:
            return []

    async def upsert_services(self, business_id: str, services_data: List[Dict[str, Any]]) -> bool:
        """Replace all services for a business"""
        try:
            # Delete existing services
            self.client.table('services').delete().eq('business_id', business_id).execute()

            # Insert new services
            if services_data:
                # Remove 'id' from data before insert (let DB auto-generate it)
                services_with_business_id = [
                    {k: v for k, v in {**service, 'business_id': business_id}.items() if k != 'id'}
                    for service in services_data
                ]
                result = self.client.table('services').insert(services_with_business_id).execute()
                return len(result.data or []) == len(services_data)
            return True
        except Exception:
            return False

    async def get_urgent_call_rules(self, business_id: str) -> List[Dict[str, Any]]:
        """Get urgent call rules for a business"""
        try:
            result = self.client.table('urgent_call_rules').select('*').eq('business_id', business_id).execute()
            if result.data:
                return [dict(item) for item in result.data]
            return []
        except Exception:
            return []

    async def upsert_urgent_call_rules(self, business_id: str, rules_data: List[Dict[str, Any]]) -> bool:
        """Replace all urgent call rules for a business"""
        try:
            # Delete existing rules
            self.client.table('urgent_call_rules').delete().eq('business_id', business_id).execute()

            # Insert new rules
            if rules_data:
                # Remove 'id' from data before insert (let DB auto-generate it)
                rules_with_business_id = [
                    {k: v for k, v in {**rule, 'business_id': business_id}.items() if k != 'id'}
                    for rule in rules_data
                ]
                result = self.client.table('urgent_call_rules').insert(rules_with_business_id).execute()
                return len(result.data or []) == len(rules_data)
            return True
        except Exception:
            return False

    async def get_booking_requirements(self, business_id: str) -> List[Dict[str, Any]]:
        """Get booking requirements for a business"""
        try:
            result = self.client.table('booking_requirements').select('*').eq('business_id', business_id).execute()
            
            # Default requirements that should always be present
            default_requirements = [
                {
                    'field_name': 'Customer Name',
                    'field_type': 'text',
                    'required': True,
                    'status': 'required',
                    'description': 'The full name of the customer'
                },
                {
                    'field_name': 'Phone Number',
                    'field_type': 'phone',
                    'required': True,
                    'status': 'required',
                    'description': 'The contact phone number of the customer'
                }
            ]

            if result.data and len(result.data) > 0:
                print(f"   get_booking_requirements: Found {len(result.data)} requirements for business_id={business_id}")
                
                # Check if defaults already exist in result.data
                existing_names = {item.get('field_name').lower() for item in result.data if item.get('field_name')}
                
                final_requirements = [dict(item) for item in result.data]
                
                # Add defaults if they don't exist
                for default in default_requirements:
                    if default['field_name'].lower() not in existing_names:
                        print(f"   Adding missing default requirement: {default['field_name']}")
                        final_requirements.insert(0, default)
                
                return final_requirements
            
            print(f"   get_booking_requirements: No requirements found, returning defaults")
            return default_requirements
        except Exception as e:
            print(f"   ❌ Exception in get_booking_requirements: {e}")
            return []

    async def upsert_booking_requirements(self, business_id: str, requirements_data: List[Dict[str, Any]]) -> bool:
        """Replace all booking requirements for a business"""
        try:
            print(f"🔄 upsert_booking_requirements: business_id={business_id}, count={len(requirements_data)}")

            # Log each requirement being saved
            for i, req in enumerate(requirements_data):
                print(f"   [{i}] field_name='{req.get('field_name')}' required={req.get('required')} status={req.get('status')}")

            # Delete existing requirements
            delete_result = self.client.table('booking_requirements').delete().eq('business_id', business_id).execute()
            print(f"   Delete result: count={len(delete_result.data or [])}")

            # Insert new requirements
            if requirements_data:
                # Build clean data: add business_id, remove id, preserve everything else
                requirements_with_business_id = []
                for req in requirements_data:
                    clean_req = {'business_id': business_id}
                    for key, value in req.items():
                        if key != 'id':
                            clean_req[key] = value
                    requirements_with_business_id.append(clean_req)

                print(f"   Preparing to insert: {len(requirements_with_business_id)} items")
                result = self.client.table('booking_requirements').insert(requirements_with_business_id).execute()
                print(f"   Insert result: count={len(result.data or [])}")
                success = len(result.data or []) == len(requirements_data)
                print(f"   Insert success: {success} (returned: {len(result.data or [])}, expected: {len(requirements_data)})")
                return success

            print(f"   No requirements to insert, returning True")
            return True
        except Exception as e:
            print(f"   ❌ Exception in upsert_booking_requirements: {e}")
            import traceback
            traceback.print_exc()
            return False

    async def save_complete_business_setup(self, user_id: str, setup_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save complete business setup"""
        try:
            # Check if business exists
            existing_business = await self.get_business_by_user_id(user_id)
            
            if existing_business:
                # Update existing business
                business_id = existing_business['id']
                await self.update_business(business_id, setup_data['business'])
                
                # Delete existing related data
                await self.upsert_business_hours(business_id, [])
                await self.upsert_services(business_id, [])
                await self.upsert_urgent_call_rules(business_id, [])
                await self.upsert_booking_requirements(business_id, [])
            else:
                # Create new business
                new_business = await self.create_business(user_id, setup_data['business'])
                if not new_business:
                    raise Exception("Failed to create business")
                business_id = new_business['id']

            # Save related data
            if setup_data.get('business_hours'):
                await self.upsert_business_hours(business_id, setup_data['business_hours'])
            
            if setup_data.get('services'):
                await self.upsert_services(business_id, setup_data['services'])
            
            if setup_data.get('urgent_call_rules'):
                await self.upsert_urgent_call_rules(business_id, setup_data['urgent_call_rules'])
            
            if setup_data.get('booking_requirements'):
                await self.upsert_booking_requirements(business_id, setup_data['booking_requirements'])

            return {'business_id': business_id, 'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

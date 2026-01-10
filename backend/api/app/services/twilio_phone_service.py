from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from app.core.config import get_settings
from typing import List, Dict, Any, Optional
import re

class TwilioPhoneService:
    def __init__(self):
        settings = get_settings()
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token.get_secret_value() if settings.twilio_auth_token else None
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid and self.auth_token else None

    def search_available_numbers(self, location: str, country: str = "US", state: str | None = None, type_filter: str = "local", limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for available phone numbers based on location and type.

        Args:
            location: City, state, or ZIP code
            country: Country code (e.g., "US", "CA", "UK")
            state: State abbreviation (e.g., "CA", "NY", "TX")
            type_filter: "local", "tollfree", or "vanity"
            limit: Maximum number of results to return (max 10)

        Returns:
            List of available phone numbers with metadata
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            results = []

            if type_filter == "tollfree":
                # Search for toll-free numbers
                numbers = self.client.available_phone_numbers("US").toll_free.list(limit=limit)

                for number in numbers:
                    capabilities = getattr(number, 'capabilities', {})
                    phone_num = getattr(number, 'phone_number', '')
                    results.append({
                        "number": getattr(number, 'friendly_name', phone_num),
                        "phone_number": phone_num,
                        "location": "Toll-Free",
                        "type": "tollfree",
                        "monthly_cost": 5.00,
                        "capabilities": {
                            "voice": capabilities.get("voice", True) if isinstance(capabilities, dict) else True,
                            "sms": capabilities.get("SMS", False) if isinstance(capabilities, dict) else False,
                            "mms": capabilities.get("MMS", False) if isinstance(capabilities, dict) else False
                        }
                    })

            elif type_filter == "vanity":
                # Vanity numbers - search for toll-free vanity patterns
                vanity_patterns = [
                    "800-CALL", "800-HELP", "888-CALL", "888-HELP", "877-HELP"
                ]

                for pattern in vanity_patterns[:limit]:
                    try:
                        # Search toll-free numbers containing the pattern
                        numbers = self.client.available_phone_numbers("US").toll_free.list(limit=limit)
                        for number in numbers:
                            phone_num = getattr(number, 'phone_number', '')
                            if pattern.replace("-", "") in phone_num:
                                capabilities = getattr(number, 'capabilities', {})
                                results.append({
                                    "number": getattr(number, 'friendly_name', phone_num),
                                    "phone_number": phone_num,
                                    "location": "Toll-Free",
                                    "type": "vanity",
                                    "monthly_cost": 10.00,
                                    "capabilities": {
                                        "voice": capabilities.get("voice", True) if isinstance(capabilities, dict) else True,
                                        "sms": capabilities.get("SMS", True) if isinstance(capabilities, dict) else True,
                                        "mms": capabilities.get("MMS", False) if isinstance(capabilities, dict) else False
                                    }
                                })
                                if len(results) >= limit:
                                    break
                        if len(results) >= limit:
                            break
                    except:
                        continue

                if not results:
                    raise Exception("No vanity numbers available")

            else:
                # Search for local numbers
                numbers = []

                # Use country parameter
                country_code = country if country else "US"

                # Use provided state if available, otherwise extract from location
                search_state = state if state else None

                # Check if it's just an area code
                if re.match(r'^\d{3}$', location.strip()):
                    area_code = location.strip()
                    numbers = self.client.available_phone_numbers(country_code).local.list(
                        area_code=area_code,
                        limit=limit
                    )
                elif re.match(r'^\d{5}$', location.strip()):
                    # ZIP code - use state if provided
                    search_params = {"in_postal_code": location.strip(), "limit": limit}
                    if search_state:
                        search_params["in_region"] = search_state
                    numbers = self.client.available_phone_numbers(country_code).local.list(**search_params)
                else:
                    # City, State or just city
                    parts = [part.strip() for part in location.split(',')]
                    if len(parts) >= 2:
                        city = parts[0]
                        # Use provided state if available, otherwise from location
                        region_param = state if state else parts[1]
                        numbers = self.client.available_phone_numbers(country_code).local.list(
                            in_locality=city,
                            in_region=region_param,
                            limit=limit
                        )
                    elif len(parts) == 1:
                        city = parts[0]
                        search_params = {"in_locality": city, "limit": limit}
                        if search_state:
                            search_params["in_region"] = search_state
                        elif len(parts) > 1:
                            search_params["in_region"] = parts[1]
                        numbers = self.client.available_phone_numbers(country_code).local.list(**search_params)
                    else:
                        # Default to popular area codes if no location specified
                        area_codes = ["415", "212", "310", "312"]
                        for code in area_codes:
                            try:
                                batch = self.client.available_phone_numbers(country_code).local.list(
                                    area_code=code,
                                    limit=min(limit // len(area_codes), 5)
                                )
                                numbers.extend(batch)
                                if len(numbers) >= limit:
                                    break
                            except:
                                continue
                        numbers = numbers[:limit]

                # Process found numbers
                for number in numbers[:limit]:
                    capabilities = getattr(number, 'capabilities', {})
                    phone_num = getattr(number, 'phone_number', '')
                    if phone_num:
                        results.append({
                            "number": getattr(number, 'friendly_name', phone_num),
                            "phone_number": phone_num,
                            "location": f"{getattr(number, 'locality', 'Unknown')}, {getattr(number, 'region', 'Unknown')}",
                            "type": "local",
                            "monthly_cost": 5.00,
                            "capabilities": {
                                "voice": capabilities.get("voice", True) if isinstance(capabilities, dict) else True,
                                "sms": capabilities.get("SMS", False) if isinstance(capabilities, dict) else False,
                                "mms": capabilities.get("MMS", False) if isinstance(capabilities, dict) else False
                            },
                            "area_code": phone_num[2:5] if len(phone_num) > 5 else None
                        })

            if not results:
                return []

            return results

        except TwilioException as e:
            raise Exception(f"Twilio API error: {str(e)}")
        except Exception as e:
            raise Exception(f"Error searching phone numbers: {str(e)}")



    def purchase_number(self, phone_number: str, webhook_url: str = None) -> Optional[Dict[str, Any]]:
        """
        Purchase a phone number from Twilio.

        Args:
            phone_number: The phone number to purchase (E.164 format)
            webhook_url: Optional URL for voice webhooks

        Returns:
            Purchase confirmation data or None if failed
        """
        if not self.client:
            raise ValueError("Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment variables.")

        try:
            # Purchase the number
            params = {"phone_number": phone_number}
            if webhook_url:
                params["voice_url"] = webhook_url
                params["voice_method"] = "POST"
                
            incoming_phone_number = self.client.incoming_phone_numbers.create(**params)

            return {
                "sid": incoming_phone_number.sid,
                "phone_number": incoming_phone_number.phone_number,
                "friendly_name": incoming_phone_number.friendly_name,
                "status": "purchased"
            }

        except TwilioException as e:
            print(f"Twilio purchase error: {e}")
            return None
        except Exception as e:
            print(f"Error purchasing number: {e}")
            return None

    def get_purchased_numbers(self) -> List[Dict[str, Any]]:
        """
        Get all purchased phone numbers for this account.

        Returns:
            List of purchased numbers
        """
        if not self.client:
            return []

        try:
            numbers = self.client.incoming_phone_numbers.list()
            return [{
                "sid": number.sid,
                "phone_number": number.phone_number,
                "friendly_name": number.friendly_name,
                "status": "active"
            } for number in numbers]

        except TwilioException as e:
            print(f"Twilio API error: {e}")
            return []
        except Exception as e:
            print(f"Error getting purchased numbers: {e}")
            return []
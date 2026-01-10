from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from app.core.config import get_settings
from typing import List, Dict, Any, Optional
from supabase import create_client
import logging

logger = logging.getLogger(__name__)

class TwilioSubaccountService:
    def __init__(self):
        settings = get_settings()
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token.get_secret_value() if settings.twilio_auth_token else None
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid and self.auth_token else None

    def create_subaccount(self, friendly_name: str) -> Optional[Dict[str, Any]]:
        """
        Create a new Twilio subaccount.

        Args:
            friendly_name: Name for the subaccount (typically business name)

        Returns:
            Subaccount details including sid, auth_token, etc.
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            subaccount = self.client.api.accounts.create(
                friendly_name=friendly_name
            )

            return {
                "sid": subaccount.sid,
                "friendly_name": subaccount.friendly_name,
                "status": subaccount.status,
                "auth_token": subaccount.auth_token,
                "account_sid": subaccount.sid,
                "date_created": str(subaccount.date_created)
            }
        except TwilioException as e:
            logger.error(f"Twilio subaccount creation error: {e}")
            return None
        except Exception as e:
            logger.error(f"Error creating subaccount: {e}")
            return None

    def get_subaccount(self, subaccount_sid: str) -> Optional[Dict[str, Any]]:
        """
        Get details of a specific subaccount.

        Args:
            subaccount_sid: The SID of the subaccount

        Returns:
            Subaccount details
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            subaccount = self.client.api.accounts(subaccount_sid).fetch()

            return {
                "sid": subaccount.sid,
                "friendly_name": subaccount.friendly_name,
                "status": subaccount.status,
                "account_sid": subaccount.sid,
                "date_created": str(subaccount.date_created),
                "date_updated": str(subaccount.date_updated)
            }
        except TwilioException as e:
            logger.error(f"Twilio subaccount fetch error: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching subaccount: {e}")
            return None

    def get_all_subaccounts(self) -> List[Dict[str, Any]]:
        """
        Get all subaccounts for the main account.

        Returns:
            List of all subaccounts
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            subaccounts = self.client.api.accounts.list()
            return [{
                "sid": subaccount.sid,
                "friendly_name": subaccount.friendly_name,
                "status": subaccount.status,
                "date_created": str(subaccount.date_created)
            } for subaccount in subaccounts if subaccount.sid != self.account_sid]
        except TwilioException as e:
            logger.error(f"Twilio list subaccounts error: {e}")
            return []
        except Exception as e:
            logger.error(f"Error listing subaccounts: {e}")
            return []

    def transfer_number_to_subaccount(self, phone_sid: str, subaccount_sid: str) -> bool:
        """
        Transfer a phone number from main account to subaccount.

        Args:
            phone_sid: The SID of the phone number to transfer
            subaccount_sid: The SID of the subaccount to transfer to

        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            phone_number = self.client.incoming_phone_numbers(phone_sid).update(
                account_sid=subaccount_sid
            )
            logger.info(f"Transferred phone number {phone_sid} to subaccount {subaccount_sid}")
            return True
        except TwilioException as e:
            logger.error(f"Twilio number transfer error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error transferring number: {e}")
            return False

    def close_subaccount(self, subaccount_sid: str) -> bool:
        """
        Close (suspend) a subaccount.

        Args:
            subaccount_sid: The SID of the subaccount to close

        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            subaccount = self.client.api.accounts(subaccount_sid).update(status='closed')
            logger.info(f"Closed subaccount {subaccount_sid}")
            return True
        except TwilioException as e:
            logger.error(f"Twilio close subaccount error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error closing subaccount: {e}")
            return False

    def get_subaccount_client(self, subaccount_sid: str, subaccount_auth_token: str) -> Optional[Client]:
        """
        Get a Twilio client for a specific subaccount.

        Args:
            subaccount_sid: The SID of the subaccount
            subaccount_auth_token: The auth token for the subaccount

        Returns:
            Twilio Client instance for the subaccount
        """
        try:
            return Client(subaccount_sid, subaccount_auth_token)
        except Exception as e:
            logger.error(f"Error creating subaccount client: {e}")
            return None

    def suspend_subaccount(self, subaccount_sid: str) -> bool:
        """
        Suspend a subaccount (temporary suspension).

        Args:
            subaccount_sid: The SID of the subaccount to suspend

        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            subaccount = self.client.api.accounts(subaccount_sid).update(status='suspended')
            logger.info(f"Suspended subaccount {subaccount_sid}")
            return True
        except TwilioException as e:
            logger.error(f"Twilio suspend subaccount error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error suspending subaccount: {e}")
            return False

    def activate_subaccount(self, subaccount_sid: str) -> bool:
        """
        Reactivate a suspended subaccount.

        Args:
            subaccount_sid: The SID of the subaccount to activate

        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            raise Exception("Twilio client not configured")

        try:
            subaccount = self.client.api.accounts(subaccount_sid).update(status='active')
            logger.info(f"Activated subaccount {subaccount_sid}")
            return True
        except TwilioException as e:
            logger.error(f"Twilio activate subaccount error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error activating subaccount: {e}")
            return False

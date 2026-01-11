import httpx
import json
import logging
from typing import Optional, Dict, Any
from app.core.config import Settings
from app.models.models import VoiceClone, Profile

# Configure logging
logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.timeout = httpx.Timeout(30.0, connect=10.0)
        
    def _log_operation(self, operation: str, user_id: str, details: Optional[Dict[str, Any]] = None):
        """Log voice service operations with structured data"""
        import time
        log_data = {
            "operation": operation,
            "user_id": user_id,
            "timestamp": time.time(),
        }
        if details:
            log_data.update(details)
        logger.info(f"VoiceService: {operation}", extra={"log_data": log_data})

    async def upload_voice_file(self, token: str, bucket: str, path: str, file_data: bytes, content_type: str, user_id: str = "unknown") -> str:
        """Upload voice file to storage with comprehensive error handling and logging"""
        try:
            self._log_operation("upload_start", user_id, {
                "bucket": bucket,
                "path": path,
                "file_size": len(file_data),
                "content_type": content_type
            })
            
            # Validate file size before upload
            if len(file_data) > 50 * 1024 * 1024:  # 50MB limit
                raise ValueError(f"File too large: {len(file_data)} bytes (max 50MB)")
            
            if len(file_data) < 1000:  # 1KB minimum
                raise ValueError(f"File too small: {len(file_data)} bytes (min 1KB)")
            
            # 1. Upload File
            upload_url = f"{self.settings.supabase_url}/storage/v1/object/{bucket}/{path}"
            headers = {
                "Authorization": f"Bearer {token}",
                "apikey": self.settings.supabase_key.get_secret_value(),
                "Content-Type": content_type,
                "x-upsert": "true"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(upload_url, content=file_data, headers=headers)
                
                if resp.status_code != 200:
                    error_msg = f"Storage upload failed ({resp.status_code}): {resp.text}"
                    logger.error(f"VoiceService upload error: {error_msg}")
                    raise Exception(error_msg)
                
                self._log_operation("upload_complete", user_id, {"path": path})
                
                # 2. Get Signed URL (valid for 1 hour)
                sign_url = f"{self.settings.supabase_url}/storage/v1/object/sign/{bucket}/{path}"
                sign_headers = {
                    "Authorization": f"Bearer {token}",
                    "apikey": self.settings.supabase_key.get_secret_value(),
                    "Content-Type": "application/json"
                }
                sign_body = {"expiresIn": 3600}
                
                resp = await client.post(sign_url, json=sign_body, headers=sign_headers)
                
                if resp.status_code != 200:
                    error_msg = f"Signed URL generation failed ({resp.status_code}): {resp.text}"
                    logger.error(f"VoiceService signed URL error: {error_msg}")
                    raise Exception(error_msg)
                
                result = resp.json()
                signed_url = f"{self.settings.supabase_url}/storage/v1{result['signedURL']}"
                
                self._log_operation("signed_url_generated", user_id, {"signed_url": signed_url})
                return signed_url
                
        except httpx.TimeoutException:
            error_msg = "Upload timeout - please try again"
            logger.error(f"VoiceService timeout: {error_msg}")
            raise Exception(error_msg)
        except httpx.NetworkError as e:
            error_msg = f"Network error during upload: {str(e)}"
            logger.error(f"VoiceService network error: {error_msg}")
            raise Exception(error_msg)
        except ValueError as e:
            logger.error(f"VoiceService validation error: {str(e)}")
            raise Exception(str(e))
        except Exception as e:
            error_msg = f"Unexpected upload error: {str(e)}"
            logger.error(f"VoiceService unexpected error: {error_msg}")
            raise Exception(error_msg)

    async def get_signed_url(self, token: str, bucket: str, path: str, expiry_seconds: int = 3600) -> str:
        """Generate a signed URL for an existing file"""
        try:
            sign_url = f"{self.settings.supabase_url}/storage/v1/object/sign/{bucket}/{path}"
            headers = {
                "Authorization": f"Bearer {token}",
                "apikey": self.settings.supabase_key.get_secret_value(),
                "Content-Type": "application/json"
            }
            sign_body = {"expiresIn": expiry_seconds}
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(sign_url, json=sign_body, headers=headers)
                
                if resp.status_code != 200:
                    error_msg = f"Signed URL generation failed ({resp.status_code}): {resp.text}"
                    logger.error(f"VoiceService signed URL error: {error_msg}")
                    raise Exception(error_msg)
                
                result = resp.json()
                signed_url = f"{self.settings.supabase_url}/storage/v1{result['signedURL']}"
                return signed_url
                
        except Exception as e:
            logger.error(f"VoiceService get_signed_url error: {str(e)}")
            raise

    async def create_voice_clone(self, token: str, clone: VoiceClone) -> VoiceClone:
        """Create voice clone record with enhanced error handling and logging"""
        try:
            self._log_operation("create_clone_start", clone.user_id, {
                "file_path": clone.file_path,
                "status": clone.status
            })
            
            url = f"{self.settings.supabase_url}/rest/v1/voice_clones"
            headers = {
                "Authorization": f"Bearer {token}",
                "apikey": self.settings.supabase_key.get_secret_value(),
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # Exclude None fields to let DB handle defaults/generation
            data = clone.model_dump(exclude_none=True)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(url, json=data, headers=headers)
                
                if resp.status_code != 201:
                    error_msg = f"Create clone failed ({resp.status_code}): {resp.text}"
                    logger.error(f"VoiceService create clone error: {error_msg}")
                    raise Exception(error_msg)
                
                result = resp.json()
                if not result:
                    error_msg = "No data returned from create clone"
                    logger.error(f"VoiceService create clone: {error_msg}")
                    raise Exception(error_msg)
                
                created_clone = VoiceClone(**result[0])
                self._log_operation("create_clone_success", clone.user_id, {
                    "clone_id": created_clone.id
                })
                
                return created_clone
                
        except httpx.TimeoutException:
            error_msg = "Create clone timeout - please try again"
            logger.error(f"VoiceService create clone timeout: {error_msg}")
            raise Exception(error_msg)
        except httpx.NetworkError as e:
            error_msg = f"Network error during clone creation: {str(e)}"
            logger.error(f"VoiceService create clone network error: {error_msg}")
            raise Exception(error_msg)
        except Exception as e:
            if "Create clone failed" in str(e):
                raise  # Re-raise already formatted errors
            error_msg = f"Unexpected clone creation error: {str(e)}"
            logger.error(f"VoiceService create clone unexpected error: {error_msg}")
            raise Exception(error_msg)

    async def update_voice_clone(self, token: str, clone_id: str, updates: dict) -> None:
        url = f"{self.settings.supabase_url}/rest/v1/voice_clones?id=eq.{clone_id}"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.patch(url, json=updates, headers=headers)
            
            if resp.status_code not in (200, 204):
                 raise Exception(f"Update clone failed ({resp.status_code}): {resp.text}")

    async def get_voice_clone(self, token: str, clone_id: str) -> VoiceClone:
        url = f"{self.settings.supabase_url}/rest/v1/voice_clones?id=eq.{clone_id}&select=*"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/vnd.pgrst.object+json"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            
            if resp.status_code != 200:
                 raise Exception(f"Get clone failed ({resp.status_code}): {resp.text}")
            
            return VoiceClone(**resp.json())

    async def get_profile(self, token: str, user_id: str) -> Profile:
        url = f"{self.settings.supabase_url}/rest/v1/profiles?id=eq.{user_id}&select=*"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/vnd.pgrst.object+json"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            
            if resp.status_code != 200:
                 raise Exception(f"Get profile failed ({resp.status_code}): {resp.text}")
            
            return Profile(**resp.json())

    async def update_profile(self, token: str, user_id: str, updates: dict) -> None:
        url = f"{self.settings.supabase_url}/rest/v1/profiles?id=eq.{user_id}"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.patch(url, json=updates, headers=headers)
            
            if resp.status_code not in (200, 204):
                 raise Exception(f"Update profile failed ({resp.status_code}): {resp.text}")

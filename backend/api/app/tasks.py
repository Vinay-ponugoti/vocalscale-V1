# 1. IMPORTS GO AT THE VERY TOP
import json
import logging
import datetime
import re
import asyncio
from typing import Optional

from celery import Task
# This import must happen before you use @celery_app.task
from app.core.celery_app import celery_app 
from app.services.email_service import EmailService
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# 2. DEFINE CLASSES
class DatabaseTask(Task):
    """Base task to ensure DB connections are handled cleanly."""
    _db = None

    @property
    def db(self):
        # Placeholder for future connection pooling if needed (e.g., SQLAlchemy)
        return self._db


# 3. DEFINE FUNCTIONS (Using the imported celery_app)

@celery_app.task(name="app.tasks.send_appointment_confirmation_email", bind=True)
def send_appointment_confirmation_email(self, to_email: str, customer_name: str, scheduled_time: str, service_type: str):
    """Task to send appointment confirmation email."""
    try:
        email_service = EmailService()
        
        # Format time nicely if it looks like an ISO string
        try:
            # Attempt to parse ISO format for better display
            dt = datetime.datetime.fromisoformat(scheduled_time)
            display_time = dt.strftime("%A, %B %d at %I:%M %p")
        except (ValueError, TypeError):
            display_time = scheduled_time

        subject = f"Appointment Confirmed: {service_type}"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Appointment Confirmed!</h1>
            <p>Hi {customer_name},</p>
            <p>Your appointment for a <strong>{service_type}</strong> has been confirmed for <strong>{display_time}</strong>.</p>
            <p>We look forward to seeing you!</p>
            <p>Best regards,<br>The Voice AI Team</p>
        </div>
        """
        success = email_service.send_email(to_email, subject, html_content)
        if success:
            logger.info(f"✅ Confirmation email sent to {to_email}")
        else:
            logger.warning(f"⚠️ Failed to send confirmation email to {to_email}")
        return success
    except Exception as e:
        logger.error(f"❌ Error in send_appointment_confirmation_email task: {e}", exc_info=True)
        return False


@celery_app.task(name="app.tasks.process_voice_clone", bind=True)
def process_voice_clone(self, user_id: str, clone_id: str, voice_sample_url: str, user_token: str):
    """
    Celery task for voice processing with real-time status updates.
    Uses asyncio.run() safely inside the synchronous task.
    """
    from app.core.config import get_settings
    from app.services.voice_service import VoiceService
    from app.services.tts_service import TTSService
    from app.services.websocket_service import WebSocketManager, VoiceProcessingStatusService
    import redis

    settings = get_settings()
    logger.info(f"🚀 CELERY: Starting task for clone {clone_id}")
    
    async def _run_processing():
        try:
            # 1. Setup Services
            redis_client = redis.from_url(settings.redis_url, decode_responses=True)
            tts_service = TTSService(settings, redis_client)
            voice_service = VoiceService(settings)
            websocket_manager = WebSocketManager(redis_client)
            status_service = VoiceProcessingStatusService(websocket_manager, redis_client)
            
            # 2. Initial Status
            await status_service.start_processing(user_id, clone_id, total_steps=4)
            await status_service.update_progress(user_id, clone_id, "Validating voice sample", 1, "Checking audio quality...")
            
            # 3. Fetch Record
            logger.info(f"🔍 CELERY: Fetching clone record for {clone_id}")
            clone_record = await voice_service.get_voice_clone(user_token, clone_id)
            file_path_or_url = clone_record.file_path
            
            # 4. Resolve URL
            target_url = voice_sample_url
            if "voice-recordings" in file_path_or_url and not file_path_or_url.startswith("http"):
                 logger.info(f"🔑 CELERY: Generating signed URL for {file_path_or_url}")
                 target_url = await voice_service.get_signed_url(user_token, "voice-recordings", file_path_or_url)
            
            logger.info(f"🔗 CELERY: Target audio URL: {target_url}")
            
            # 5. Prepare Synthesis
            await status_service.update_progress(user_id, clone_id, "Preparing synthesis", 2, "Setting up voice synthesis...")
            
            text = "Hi there! I'm your new AI receptionist. I can handle your calls, schedule appointments, and answer questions just like you would. How does this sound?"
            
            await status_service.update_progress(user_id, clone_id, "Generating voice", 3, "Creating AI voice clone...")
            
            # 6. Synthesize
            logger.info(f"🚀 CELERY: Calling TTS service for synthesis...")
            audio_url = await tts_service.synthesize(text, target_url)
            logger.info(f"✅ CELERY: Synthesis complete! Audio URL: {audio_url}")
            
            # 7. Finalize
            await status_service.update_progress(user_id, clone_id, "Finalizing", 4, "Saving your voice clone...")
            
            updates = {"status": "completed", "sample_url": audio_url}
            await voice_service.update_voice_clone(user_token, clone_id, updates)
            
            await status_service.complete_processing(user_id, clone_id, audio_url)
            logger.info(f"🏁 CELERY: Task finished successfully for clone {clone_id}")
            
            # Cleanup Redis connection
            await redis_client.close()
            return True
            
        except Exception as e:
            logger.error(f"❌ CELERY: Error processing voice clone: {str(e)}", exc_info=True)
            return False

    # Run the async function safely
    return asyncio.run(_run_processing())
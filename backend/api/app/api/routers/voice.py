from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from typing import Annotated, Optional
import time
import logging
import redis
from app.middleware.auth import get_current_user, AuthenticatedUser
from app.services.voice_service import VoiceService
from app.services.tts_service import TTSService
from app.services.voice_quality_service import VoiceQualityValidator
from app.api.dependencies import get_voice_service, get_tts_service, get_settings
from app.core.config import Settings
from app.models.models import VoiceClone, SynthesisRequest, UploadVoiceResponse, ProcessVoiceResponse, ProcessVoiceRequest, VoiceCloneStatusResponse
from app.tasks import process_voice_clone

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()



@router.post("/voice/upload", response_model=UploadVoiceResponse)
async def upload_voice(
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(get_current_user),
    service: VoiceService = Depends(get_voice_service)
):
    """Enhanced voice upload with quality validation and error handling"""
    try:
        # Validate file type
        allowed_types = [
            "audio/wav", "audio/webm", "audio/mpeg", "audio/mp3", "audio/ogg",
            "audio/mp4", "audio/x-m4a", "audio/m4a", "video/mp4", "video/webm"
        ]
        mime_type = file.content_type or "audio/wav"
        
        if mime_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type: {mime_type}. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Read and validate file
        file_bytes = await file.read()
        
        # Enhanced file size validation
        if len(file_bytes) > 50 * 1024 * 1024:  # 50MB
            raise HTTPException(
                status_code=400, 
                detail=f"File too large: {len(file_bytes) / (1024*1024):.1f}MB (max 50MB)"
            )
        
        if len(file_bytes) < 1000:  # 1KB minimum
            raise HTTPException(
                status_code=400, 
                detail=f"File too small: {len(file_bytes)} bytes (min 1KB)"
            )
        
        # Quality validation
        quality_validator = VoiceQualityValidator()
        quality_result = await quality_validator.validate_audio_file(file_bytes, mime_type)
        
        if not quality_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Audio quality check failed: {quality_result['error']}"
            )
        
        # Check quality score
        quality_score = quality_result.get("quality_score", 100)
        if quality_score < 60:
            recommendations = quality_result.get("recommendations", [])
            raise HTTPException(
                status_code=400,
                detail=f"Audio quality is too low (score: {quality_score}). Recommendations: {', '.join(recommendations[:2])}"
            )
        
        logger.info(f"Audio quality passed: score={quality_score}")
        
        # Determine file extension
        ext_map = {
            "audio/wav": "wav",
            "audio/webm": "webm", 
            "audio/mpeg": "mp3",
            "audio/mp3": "mp3",
            "audio/ogg": "ogg",
            "audio/mp4": "m4a",
            "audio/x-m4a": "m4a",
            "audio/m4a": "m4a",
            "video/mp4": "mp4",
            "video/webm": "webm"
        }
        ext = ext_map.get(mime_type, "wav")
        
        # Generate unique filename
        timestamp = int(time.time() * 1000)
        path = f"{user.user_id}/{timestamp}.{ext}"
        
        # Upload with enhanced error handling
        public_url = await service.upload_voice_file(
            user.token, 
            "voice-recordings", 
            path, 
            file_bytes, 
            mime_type,
            user.user_id
        )
        
        # Return enhanced response with quality info
        return {
            "url": public_url,
            "quality_score": quality_score,
            "recommendations": quality_result.get("recommendations", [])
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Voice upload endpoint error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Upload failed. Please try again."
        )

@router.post("/voice/process", response_model=ProcessVoiceResponse)
async def process_voice(
    req: ProcessVoiceRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    voice_service: VoiceService = Depends(get_voice_service)
):
    """Start voice cloning process using Celery background task"""
    # 1. Create initial record in DB via service
    clone = VoiceClone(
        user_id=user.user_id,
        file_path=req.voice_sample_url,
        status="processing"
    )
    
    try:
        logger.info("Creating clone record in DB...")
        created_clone = await voice_service.create_voice_clone(user.token, clone)
        
        if not created_clone.id:
            raise Exception("Failed to create clone - no ID returned")
        
        logger.info(f"Clone record created: {created_clone.id}")
        
        # 2. Dispatch Celery task
        process_voice_clone.delay(user.user_id, created_clone.id, req.voice_sample_url, user.token)
        
        return {
            "audio_url": None,
            "clone_id": created_clone.id,
            "status": "processing"
        }
    except Exception as e:
        logger.error(f"Process endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voice/status/{clone_id}", response_model=VoiceCloneStatusResponse)
async def get_voice_status(
    clone_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    voice_service: VoiceService = Depends(get_voice_service)
):
    try:
        clone = await voice_service.get_voice_clone(user.token, clone_id)
        return {
            "id": clone.id,
            "status": clone.status,
            "sample_url": clone.sample_url
        }
    except Exception as e:
        logger.error(f"Get voice status error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get voice status")

@router.post("/synthesize")
async def synthesize(
    req: SynthesisRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    tts_service: TTSService = Depends(get_tts_service)
):
    try:
        if not req.voice_sample_url and not req.voice_id:
            raise HTTPException(
                status_code=400, 
                detail="Either voice_sample_url or voice_id must be provided"
            )
        
        audio_url = await tts_service.synthesize(
            req.text, 
            req.voice_sample_url or "", 
            req.voice_id
        )
        return {"audio_url": audio_url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Synthesize endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="Synthesis failed. Please try again.")

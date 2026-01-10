
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

# --- Voice Models ---

class Voice(BaseModel):
    id: UUID
    name: Optional[str] = None # Mapped from model_name
    model_name: Optional[str] = None
    model_id: Optional[str] = None
    gender: Optional[str] = "Female"
    accent: Optional[str] = "US"
    provider: str = "Deepgram"
    provider_voice_id: Optional[str] = None
    sample_audio_url: Optional[str] = None
    is_premium: bool = False
    is_active: bool = False # Default to False for system voices

class VoiceListResponse(BaseModel):
    data: list[Voice]
    count: int

# --- Voice Settings Models ---

class VoiceSettings(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    model_id: Optional[str] = None # The actual voice ID string (aura-athena-en)
    model_name: Optional[str] = None
    speaking_speed: float = 1.0
    conversation_tone: str = "friendly"
    custom_greeting: Optional[str] = None
    after_hours_greeting: Optional[str] = None
    language: str = "en-US"
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Legacy/Frontend compatibility
    voice_id: Optional[str] = None # Aliased to model_id for frontend

class VoiceSettingsUpdate(BaseModel):
    voice_id: Optional[str] = None # Accepts model_id string
    speaking_speed: Optional[float] = Field(None, ge=0.5, le=2.0)
    conversation_tone: Optional[str] = None
    custom_greeting: Optional[str] = None
    after_hours_greeting: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None

class VoiceSettingsResponse(BaseModel):
    data: VoiceSettings

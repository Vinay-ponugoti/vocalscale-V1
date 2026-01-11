from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- Requests ---

class SynthesisRequest(BaseModel):
    text: str
    voice_sample_url: Optional[str] = None  # Optional if VoiceID is provided
    voice_id: Optional[str] = None          # ID from 'voices' table

class ProcessVoiceRequest(BaseModel):
    voice_sample_url: str

class UploadVoiceResponse(BaseModel):
    url: str
    quality_score: Optional[int] = None
    recommendations: Optional[list] = None

class ProcessVoiceResponse(BaseModel):
    audio_url: Optional[str] = None
    clone_id: str
    status: str

class VoiceCloneStatusResponse(BaseModel):
    id: str
    status: str
    sample_url: Optional[str] = None

# --- Database Models ---

class Profile(BaseModel):
    id: str
    voice_sample_url: Optional[str] = None
    is_voice_setup_completed: bool = False
    google_refresh_token: Optional[str] = None
    google_account_id: Optional[str] = None
    google_location_id: Optional[str] = None
    google_connected_at: Optional[str] = None

class UserProfile(BaseModel):
    id: Optional[str] = None
    first_name: str = ""
    last_name: str = ""
    email: str = ""
    phone: str = ""
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Voice(BaseModel):
    id: str
    name: str
    sample_url: str
    sample_text: str

class VoiceClone(BaseModel):
    id: Optional[str] = None
    user_id: str
    file_path: str
    status: str
    sample_url: Optional[str] = None

# --- Dashboard Models ---

class StatsSummary(BaseModel):
    total: int
    urgent: int
    handled: int

class ChartDataPoint(BaseModel):
    day: str
    calls: int
    active: bool

class DashboardResponse(BaseModel):
    stats: StatsSummary
    recentCalls: List[Dict[str, Any]]
    appointments: List[Dict[str, Any]]
    chartData: List[ChartDataPoint]

# --- Business Setup Models ---

class BusinessDetails(BaseModel):
    business_name: str
    category: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    email: Optional[str] = None
    contact_name: Optional[str] = None

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

class NotificationSettings(BaseModel):
    id: Optional[str] = None
    urgent_call_alerts: bool = True
    booking_confirmations: bool = True
    missed_call_alerts: bool = True
    transfer_number: Optional[str] = None
    standard_transfer_number: Optional[str] = None

class BookingRequirement(BaseModel):
    id: Optional[str] = None
    field_name: str
    required: bool = True
    field_type: str

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

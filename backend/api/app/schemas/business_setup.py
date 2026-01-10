from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import time
from decimal import Decimal

# --- Business Details Schemas ---
class BusinessDetails(BaseModel):
    business_name: str
    category: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    timezone: Optional[str] = "America/New_York"

class BusinessDetailsUpdate(BaseModel):
    business_name: Optional[str] = None
    category: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    timezone: Optional[str] = None

# --- Business Hours Schemas ---
class BusinessHour(BaseModel):
    id: Optional[str] = None
    day_of_week: str  # 'monday', 'tuesday', etc.
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    enabled: bool = True

class BusinessHoursCreate(BaseModel):
    business_hours: List[BusinessHour]

# --- Services Schemas ---
class Service(BaseModel):
    id: Optional[str] = None
    name: str
    price: Optional[Decimal] = None
    description: Optional[str] = None

class ServicesCreate(BaseModel):
    services: List[Service]

# --- Urgent Call Rules Schemas ---
class UrgentCallRule(BaseModel):
    id: Optional[str] = None
    condition_text: str
    action: str
    contact: Optional[str] = None

class UrgentCallRulesCreate(BaseModel):
    urgent_call_rules: List[UrgentCallRule]

# --- Booking Requirements Schemas ---
class BookingRequirement(BaseModel):
    id: Optional[str] = None
    field_name: str
    required: bool = True
    field_type: str  # 'text', 'email', 'phone', etc.

class BookingRequirementsCreate(BaseModel):
    booking_requirements: List[BookingRequirement]

# --- Complete Business Setup Schemas ---
class BusinessSetupRequest(BaseModel):
    business: BusinessDetails
    business_hours: Optional[List[BusinessHour]] = []
    services: Optional[List[Service]] = []
    urgent_call_rules: Optional[List[UrgentCallRule]] = []
    booking_requirements: Optional[List[BookingRequirement]] = []

class BusinessSetupResponse(BaseModel):
    business: BusinessDetails
    business_hours: List[BusinessHour]
    services: List[Service]
    urgent_call_rules: List[UrgentCallRule]
    booking_requirements: List[BookingRequirement]
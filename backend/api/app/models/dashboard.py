from enum import Enum
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class CallStatus(str, Enum):
    COMPLETED = "Completed"
    ACTION_REQ = "Action Req"
    PENDING = "Pending"
    HANDLED = "Handled"
    UNKNOWN = "Unknown"

class CallCategory(str, Enum):
    BOOKING = "Booking"
    INQUIRY = "Inquiry"
    SUPPORT = "Support"
    URGENT = "Urgent"
    GENERAL = "General"
    COMPLAINT = "Complaint"
    FOLLOW_UP = "Follow-up"

class StatTrend(BaseModel):
    value: float
    is_positive: bool = Field(True, alias="isPositive")

class CallStats(BaseModel):
    total: int
    total_trend: Optional[StatTrend] = Field(None, alias="totalTrend")
    urgent: int
    urgent_trend: Optional[StatTrend] = Field(None, alias="urgentTrend")
    handled: int
    handled_trend: Optional[StatTrend] = Field(None, alias="handledTrend")
    minutes_saved: float = Field(0.0, alias="minutesSaved")
    minutes_saved_trend: Optional[StatTrend] = Field(None, alias="minutesSavedTrend")
    appointments_trend: Optional[StatTrend] = Field(None, alias="appointmentsTrend")

class Call(BaseModel):
    id: str
    created_at: datetime
    is_urgent: bool = False
    status: Optional[str] = "Unknown"
    caller_name: Optional[str] = "Unknown"
    caller_phone: Optional[str] = None
    category: Optional[str] = "General"
    summary: Optional[str] = None
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    follow_up_required: Optional[bool] = False
    handled_by: Optional[str] = None
    transcript: Optional[str] = None
    sentiment: Optional[str] = None
    lead_score: Optional[int] = 0
    duration_seconds: Optional[int] = Field(0, alias="duration_seconds")

    model_config = ConfigDict(
        from_attributes=True,
        extra='ignore'
    )

class Appointment(BaseModel):
    id: str
    scheduled_time: datetime
    customer_name: Optional[str] = "Unknown"
    service_type: Optional[str] = "General"

    model_config = ConfigDict(
        from_attributes=True,
        extra='ignore'
    )

class ChartDataPoint(BaseModel):
    day: str
    calls: int
    active: bool

class DashboardStatsResponse(BaseModel):
    stats: CallStats
    recent_calls: List[Call] = Field(..., alias="recentCalls")
    appointments: List[Appointment]
    chart_data: List[ChartDataPoint] = Field(..., alias="chartData")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        extra='ignore'
    )

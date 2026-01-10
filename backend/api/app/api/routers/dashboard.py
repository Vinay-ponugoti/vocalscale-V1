import hashlib
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.dependencies import get_dashboard_service
from app.middleware.auth import AuthenticatedUser, get_current_user
from app.models.dashboard import DashboardStatsResponse, Call, Appointment
from app.models.common import PaginatedResponse
from app.services.dashboard_service import DashboardService

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/dashboard/calls", response_model=PaginatedResponse[Call])
@limiter.limit("30/minute")
async def get_calls(
    request: Request,
    page: int = 1,
    size: int = 10,
    status: str = None,
    category: str = None,
    start_date: str = None,
    end_date: str = None,
    search: str = None,
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Get paginated call logs with filtering."""
    return await service.get_calls_paginated(
        user.user_id, 
        user.token, 
        page, 
        size,
        status=status,
        category=category,
        start_date=start_date,
        end_date=end_date,
        search=search
    )

@router.get("/dashboard/calls/{call_id}", response_model=Call)
@limiter.limit("60/minute")
async def get_call_detail(
    request: Request,
    call_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Get details for a specific call."""
    return await service.get_call_by_id(user.user_id, user.token, call_id)

@router.get("/dashboard/appointments", response_model=PaginatedResponse[Appointment])
@limiter.limit("30/minute")
async def get_appointments(
    request: Request,
    page: int = 1,
    size: int = 10,
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Get paginated appointments."""
    return await service.get_appointments_paginated(user.user_id, user.token, page, size)

@router.post("/dashboard/appointments", response_model=Appointment)
@limiter.limit("20/minute")
async def create_appointment(
    request: Request,
    appointment: dict,
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Create a new appointment."""
    return await service.create_appointment(user.user_id, user.token, appointment)

@router.patch("/dashboard/appointments/{appointment_id}", response_model=Appointment)
@limiter.limit("20/minute")
async def update_appointment(
    request: Request,
    appointment_id: str,
    updates: dict,
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Update an appointment."""
    return await service.update_appointment(user.user_id, user.token, appointment_id, updates)

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
@limiter.limit("60/minute")
async def get_dashboard_stats(
    request: Request,
    date: str,
    days: int = 7,
    timezone: str = "America/New_York",
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    # 1. Validate Date (Pydantic style validation could be done via a query model, 
    # but strict ISO parsing here is fine)
    try:
        # Handle 'Z' manually if python version < 3.11, though fromisoformat usually handles it in newer versions.
        # Robust parsing for JS style ISO strings.
        parsed_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
    except ValueError:
        try:
             # Fallback for some JS clients
            parsed_date = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ")
        except ValueError:
            logger.warning(f"Invalid date format received: {date}")
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO 8601.")

    logger.info(f"Dashboard stats requested by {user.user_id} for {parsed_date} ({days} days)")

    # 2. Fetch Data
    result = await service.get_dashboard_stats(user.user_id, parsed_date, user.token, days, timezone=timezone)
    
    # 3. Serialization & ETag Generation
    # Use by_alias=True to ensure camelCase output for frontend
    json_content = result.model_dump_json(by_alias=True)
    
    etag_value = hashlib.sha256(json_content.encode("utf-8")).hexdigest()
    etag_header = f'"{etag_value}"'

    # 4. Check If-None-Match (HTTP 304)
    if_none_match = request.headers.get("if-none-match")
    if if_none_match == etag_header:
        return Response(status_code=304, headers={"ETag": etag_header})

    # 5. Return Response
    headers = {
        "ETag": etag_header,
        "Cache-Control": "private, max-age=10, must-revalidate",
        "Vary": "Authorization, Accept-Encoding",
    }
    
    # Return raw JSON directly to avoid double serialization cost of JSONResponse(content=dict)
    return Response(content=json_content, media_type="application/json", headers=headers)

@router.get("/dashboard/notifications", response_model=list[Call])
@limiter.limit("60/minute")
async def get_notifications(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Get urgent call notifications."""
    return await service.get_urgent_calls(user.user_id, user.token)

@router.post("/dashboard/notifications/{call_id}/dismiss")
@limiter.limit("60/minute")
async def dismiss_notification(
    request: Request,
    call_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Dismiss an urgent call notification."""
    success = await service.dismiss_urgent_call(user.user_id, user.token, call_id)
    return {"success": success}

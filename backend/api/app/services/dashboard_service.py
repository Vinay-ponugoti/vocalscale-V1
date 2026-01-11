import json
import logging
import asyncio
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo
import redis
import httpx
from fastapi import HTTPException
from supabase import create_client, Client
from app.core.config import Settings
from app.services.cache_service import CacheService
from app.models.dashboard import (
    DashboardStatsResponse, CallStats, Call, Appointment, ChartDataPoint, StatTrend
)
from app.models.common import PaginatedResponse

logger = logging.getLogger(__name__)

class DashboardService:
    def __init__(self, settings: Settings, cache: CacheService):
        self.settings = settings
        self.cache = cache
        # We might not strictly need self.supabase if we use direct REST for RLS,
        # but it's good for admin tasks if needed.
        key = settings.supabase_service_key.get_secret_value() if settings.supabase_service_key else settings.supabase_key.get_secret_value()
        self.supabase: Client = create_client(settings.supabase_url, key)
        self.base_url = f"{settings.supabase_url}/rest/v1"

    def _get_timezone_aware_range(self, date: datetime, timezone_str: str) -> Tuple[str, str]:
        """Calculates start and end of day in UTC for a given date in a specific timezone."""
        try:
            tz = ZoneInfo(timezone_str)
        except Exception:
            tz = ZoneInfo("UTC")
            
        # Create date at start of day in the given timezone
        local_start = datetime(date.year, date.month, date.day, 0, 0, 0, tzinfo=tz)
        local_end = local_start + timedelta(days=1) - timedelta(microseconds=1)
        
        # Convert to UTC and format for Supabase
        utc_start = local_start.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        utc_end = local_end.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        
        return utc_start, utc_end

    def _calculate_trend(self, current: float, previous: float) -> Optional[StatTrend]:
        """Calculates percentage change between current and previous periods."""
        if previous == 0:
            if current > 0:
                return StatTrend(value=100.0, isPositive=True)
            return StatTrend(value=0.0, isPositive=True)
        
        diff = current - previous
        percent = (diff / previous) * 100
        return StatTrend(value=round(abs(percent), 1), isPositive=diff >= 0)

    async def get_dashboard_stats(self, user_id: str, date: datetime, token: str, days: int = 7, timezone: str = "America/New_York") -> DashboardStatsResponse:
        """
        Fetches dashboard statistics for a given user and date.
        Uses RLS via the provided user token.
        """
        if not token:
            raise ValueError("User token is required for dashboard statistics")

        date_iso = date.date().isoformat()
        cache_key = f"dashboard:{user_id}:{date_iso}:{days}:{timezone}"

        # Separate cache key for total duration (longer TTL since it changes less frequently)
        total_duration_cache_key = f"dashboard:total_duration:{user_id}"

        # 1. Try Cache
        cached_data = self.cache.get(cache_key, model=DashboardStatsResponse)
        if cached_data:
            logger.info(f"Cache HIT: {cache_key}")
            return cached_data

        logger.info(f"Fetching fresh dashboard data for user {user_id} on {date_iso} with tz {timezone}")

        # 2. Define Time Windows
        # Current Period
        dt_start_current = (date - timedelta(days=days-1))
        start_current_window, _ = self._get_timezone_aware_range(dt_start_current, timezone)
        _, end_current_window = self._get_timezone_aware_range(date, timezone)
        
        # Previous Period (for trends)
        dt_start_prev = (dt_start_current - timedelta(days=days))
        dt_end_prev = (dt_start_current - timedelta(days=1))
        start_prev_window, _ = self._get_timezone_aware_range(dt_start_prev, timezone)
        _, end_prev_window = self._get_timezone_aware_range(dt_end_prev, timezone)

        # Extended lookback for recent calls
        dt_start_recent = (date - timedelta(days=30))
        start_recent_window, _ = self._get_timezone_aware_range(dt_start_recent, timezone)
        
        # Extended lookahead for appointments
        dt_end_appts = (date + timedelta(days=30))
        _, end_appts_window = self._get_timezone_aware_range(dt_end_appts, timezone)

        # 3. Try to get cached total duration
        total_duration_cached = self.cache.get(total_duration_cache_key)
        fetch_all_calls_for_duration = True
        minutes_saved = 0.0  # Initialize variable

        if total_duration_cached is not None and isinstance(total_duration_cached, (int, float)):
            logger.info(f"Total duration cache HIT: {total_duration_cache_key}")
            minutes_saved = round(float(total_duration_cached) / 60, 1)
            fetch_all_calls_for_duration = False
        else:
            logger.info(f"Total duration cache MISS: {total_duration_cache_key}")

        # 4. Fetch Data from Supabase (Parallel Requests)
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json"
        }

        async with httpx.AsyncClient() as client:
            try:
                # Queries
                current_calls_query = f"select=is_urgent,status,duration_seconds&created_at=gte.{start_current_window}&created_at=lte.{end_current_window}"
                prev_calls_query = f"select=is_urgent,status,duration_seconds&created_at=gte.{start_prev_window}&created_at=lte.{end_prev_window}"
                
                recent_calls_query = f"select=*&created_at=gte.{start_recent_window}&created_at=lte.{end_current_window}&order=created_at.desc&limit=20"
                appts_query = f"select=*&scheduled_time=gte.{start_current_window}&scheduled_time=lte.{end_appts_window}&order=scheduled_time.asc"
                
                prev_appts_query = f"select=id&scheduled_time=gte.{start_prev_window}&scheduled_time=lte.{end_prev_window}"
                
                chart_query = f"select=created_at&created_at=gte.{start_current_window}&created_at=lte.{end_current_window}"

                queries = [
                    f"{self.base_url}/calls?{current_calls_query}",
                    f"{self.base_url}/calls?{prev_calls_query}",
                    f"{self.base_url}/calls?{recent_calls_query}",
                    f"{self.base_url}/appointments?{appts_query}",
                    f"{self.base_url}/appointments?{prev_appts_query}",
                    f"{self.base_url}/calls?{chart_query}"
                ]
                
                if fetch_all_calls_for_duration:
                    queries.append(f"{self.base_url}/calls?select=duration_seconds")

                responses = await self._fetch_all(client, headers, queries)
                
                current_calls_data = responses[0].json()
                prev_calls_data = responses[1].json()
                recent_calls_data = responses[2].json()
                appts_data = responses[3].json()
                prev_appts_data = responses[4].json()
                chart_raw_data = responses[5].json()
                
                if fetch_all_calls_for_duration:
                    all_calls_duration_data = responses[6].json()
                    total_duration = sum(c.get('duration_seconds') or 0 for c in all_calls_duration_data)
                    minutes_saved = round(total_duration / 60, 1)
                    self.cache.set(total_duration_cache_key, total_duration, ttl=300)

            except Exception as e:
                logger.error(f"Error fetching dashboard data: {e}")
                raise e

        # 5. Process Data
        curr_total = len(current_calls_data)
        curr_urgent = sum(1 for c in current_calls_data if c.get('is_urgent'))
        curr_handled = sum(1 for c in current_calls_data if str(c.get('status', '')).lower() == 'handled')
        curr_minutes = sum((c.get('duration_seconds') or 0) for c in current_calls_data) / 60
        curr_appts = len(appts_data)

        prev_total = len(prev_calls_data)
        prev_urgent = sum(1 for c in prev_calls_data if c.get('is_urgent'))
        prev_handled = sum(1 for c in prev_calls_data if str(c.get('status', '')).lower() == 'handled')
        prev_minutes = sum((c.get('duration_seconds') or 0) for c in prev_calls_data) / 60
        prev_appts = len(prev_appts_data)

        stats = CallStats(
            total=curr_total,
            totalTrend=self._calculate_trend(curr_total, prev_total),
            urgent=curr_urgent,
            urgentTrend=self._calculate_trend(curr_urgent, prev_urgent),
            handled=curr_handled,
            handledTrend=self._calculate_trend(curr_handled, prev_handled),
            minutesSaved=minutes_saved,
            minutesSavedTrend=self._calculate_trend(curr_minutes, prev_minutes),
            appointmentsTrend=self._calculate_trend(curr_appts, prev_appts)
        )

        recent_calls = [Call(**c) for c in recent_calls_data[:6]]
        appointments = [Appointment(**a) for a in appts_data[:8]]

        chart_data = self._generate_chart_data(date, chart_raw_data, days, timezone)

        response = DashboardStatsResponse(
            stats=stats,
            recentCalls=recent_calls,
            appointments=appointments,
            chartData=chart_data
        )

        self.cache.set(cache_key, response, ttl=30)
        return response

    async def get_calls_paginated(
        self, 
        user_id: str, 
        token: str, 
        page: int = 1, 
        size: int = 10,
        status: str = None,
        category: str = None,
        start_date: str = None,
        end_date: str = None,
        search: str = None
    ) -> PaginatedResponse[Call]:
        """Fetches a paginated list of calls for a user with optional filters."""
        # 1. Try Cache
        cache_key = f"calls:{user_id}:{page}:{size}:{status}:{category}:{start_date}:{end_date}:{search}"
        cached_data = self.cache.get(cache_key, model=PaginatedResponse[Call])
        if cached_data:
            logger.debug(f"Cache HIT for calls: {cache_key}")
            return cached_data

        offset = (page - 1) * size
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json",
            "Prefer": "count=exact"
        }

        async with httpx.AsyncClient() as client:
            # Construct query parameters for PostgREST
            params = [
                "select=*",
                "order=created_at.desc",
                f"limit={size}",
                f"offset={offset}"
            ]

            if status and status != "All":
                params.append(f"status=eq.{status}")
            
            if category and category != "All":
                params.append(f"category=eq.{category}")
            
            if start_date:
                params.append(f"created_at=gte.{start_date}")
            
            if end_date:
                params.append(f"created_at=lte.{end_date}")
            
            if search:
                # Simple OR search for multiple fields
                search_term = f"%{search}%"
                # PostgREST syntax for OR with multiple ILIKE
                or_query = f"caller_name.ilike.{search_term},caller_phone.ilike.{search_term},category.ilike.{search_term},summary.ilike.{search_term},transcript.ilike.{search_term},status.ilike.{search_term}"
                params.append(f"or=({or_query})")

            query_string = "&".join(params)
            url = f"{self.base_url}/calls?{query_string}"
            
            logger.debug(f"Fetching calls with URL: {url}")
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            
            calls_data = resp.json()
            total_count = int(resp.headers.get("Content-Range", "0-0/0").split("/")[-1])
            
            items = [Call(**c) for c in calls_data]
            pages = (total_count + size - 1) // size

            result = PaginatedResponse(
                items=items,
                total=total_count,
                page=page,
                size=size,
                pages=pages,
                next_page=page + 1 if page < pages else None,
                prev_page=page - 1 if page > 1 else None
            )

            # 2. Cache Result (60 seconds)
            self.cache.set(cache_key, result, ttl=60)
            return result

    async def get_call_by_id(self, user_id: str, token: str, call_id: str) -> Call:
        """Fetches a single call by ID."""
        # 1. Try Cache
        cache_key = f"call:{user_id}:{call_id}"
        cached_data = self.cache.get(cache_key, model=Call)
        if cached_data:
            return cached_data

        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json",
        }

        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/calls?id=eq.{call_id}&select=*"
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            
            data = resp.json()
            if not data:
                raise HTTPException(status_code=404, detail="Call not found")
            
            result = Call(**data[0])
            # 2. Cache Result (5 minutes)
            self.cache.set(cache_key, result, ttl=300)
            return result

    async def get_appointments_paginated(self, user_id: str, token: str, page: int = 1, size: int = 10) -> PaginatedResponse[Appointment]:
        """Fetches a paginated list of appointments for a user."""
        # 1. Try Cache
        cache_key = f"appointments:{user_id}:{page}:{size}"
        cached_data = self.cache.get(cache_key, model=PaginatedResponse[Appointment])
        if cached_data:
            return cached_data

        offset = (page - 1) * size
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json",
            "Prefer": "count=exact"
        }

        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/appointments?select=*&order=scheduled_time.asc&limit={size}&offset={offset}"
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            
            appts_data = resp.json()
            total_count = int(resp.headers.get("Content-Range", "0-0/0").split("/")[-1])
            
            items = [Appointment(**a) for a in appts_data]
            pages = (total_count + size - 1) // size

            result = PaginatedResponse(
                items=items,
                total=total_count,
                page=page,
                size=size,
                pages=pages,
                next_page=page + 1 if page < pages else None,
                prev_page=page - 1 if page > 1 else None
            )

            # 2. Cache Result (60 seconds)
            self.cache.set(cache_key, result, ttl=60)
            return result

    async def create_appointment(self, user_id: str, token: str, appointment_data: dict) -> Appointment:
        """Creates a new appointment."""
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/appointments",
                headers=headers,
                json=appointment_data
            )
            resp.raise_for_status()
            data = resp.json()
            result = Appointment(**data[0])

            # Invalidate caches
            self.cache.invalidate_pattern(f"appointments:{user_id}:*")
            self.cache.invalidate_pattern(f"dashboard:{user_id}:*")

            return result

    async def update_appointment(self, user_id: str, token: str, appointment_id: str, updates: dict) -> Appointment:
        """Updates an existing appointment."""
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        async with httpx.AsyncClient() as client:
            resp = await client.patch(
                f"{self.base_url}/appointments?id=eq.{appointment_id}",
                headers=headers,
                json=updates
            )
            resp.raise_for_status()
            data = resp.json()
            if not data:
                raise HTTPException(status_code=404, detail="Appointment not found")
            result = Appointment(**data[0])

            # Invalidate caches
            self.cache.invalidate_pattern(f"appointments:{user_id}:*")
            self.cache.invalidate_pattern(f"dashboard:{user_id}:*")

            return result

    async def get_urgent_calls(self, user_id: str, token: str) -> List[Call]:
        """Fetches urgent calls (notifications)."""
        # 1. Try Cache
        cache_key = f"notifications:{user_id}"
        cached_data = self.cache.get(cache_key, model=Call, is_list=True)
        if cached_data is not None:
            return cached_data

        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json",
        }

        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/calls?is_urgent=eq.true&select=id,caller_name,caller_phone,created_at,summary,category,notes&order=created_at.desc"
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            
            result = [Call(**c) for c in resp.json()]
            # 2. Cache Result (30 seconds)
            self.cache.set(cache_key, result, ttl=30)
            return result

    async def dismiss_urgent_call(self, user_id: str, token: str, call_id: str) -> bool:
        """Dismisses an urgent call notification."""
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": self.settings.supabase_key.get_secret_value(),
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/calls?id=eq.{call_id}"
            resp = await client.patch(
                url,
                headers=headers,
                json={"is_urgent": False, "status": "Handled"}
            )
            resp.raise_for_status()
            
            # Invalidate caches
            self.cache.delete(f"notifications:{user_id}")
            self.cache.delete(f"call:{user_id}:{call_id}")
            self.cache.invalidate_pattern(f"calls:{user_id}:*")
            self.cache.invalidate_pattern(f"dashboard:{user_id}:*")
            
            return True

    async def _fetch_all(self, client: httpx.AsyncClient, headers: dict, urls: list):
        # Helper to run requests in parallel
        requests = [client.get(url, headers=headers) for url in urls]
        responses = await asyncio.gather(*requests)
        for resp in responses:
            resp.raise_for_status()
        return responses

    def _generate_chart_data(self, target_date: datetime, raw_data: list, days: int = 7, timezone_str: str = "UTC") -> list[ChartDataPoint]:
        chart_data = []
        days_map = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        try:
            tz = ZoneInfo(timezone_str)
        except Exception:
            tz = ZoneInfo("UTC")

        # Pre-process raw dates for faster lookup
        call_counts = {}
        for entry in raw_data:
            try:
                # Supabase dates are in UTC
                dt_utc = datetime.fromisoformat(entry['created_at'].replace('Z', '+00:00'))
                # Convert to local business timezone
                dt_local = dt_utc.astimezone(tz)
                date_key = dt_local.date().isoformat()
                call_counts[date_key] = call_counts.get(date_key, 0) + 1
            except (ValueError, KeyError):
                continue

        # Generate last N days based on local business time
        # Ensure target_date is in the local timezone
        if target_date.tzinfo is None:
            target_date = target_date.replace(tzinfo=ZoneInfo("UTC")).astimezone(tz)
        else:
            target_date = target_date.astimezone(tz)

        for i in range(days - 1, -1, -1):
            d = target_date - timedelta(days=i)
            date_key = d.date().isoformat()

            # For 30 days, use 'Dec 12' format, for 7 days use 'Mon'
            if days > 7:
                day_label = d.strftime('%b %d')
            else:
                day_label = days_map[d.weekday()]
                
            count = call_counts.get(date_key, 0)

            chart_data.append(ChartDataPoint(
                day=day_label,
                calls=count,
                active=(i == 0)
            ))

        return chart_data

import asyncio

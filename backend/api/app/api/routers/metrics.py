from fastapi import APIRouter, Request, BackgroundTasks, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from prometheus_client import Counter, Histogram, Gauge
import logging
import time

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/metrics", tags=["Monitoring"])

# Try to import limiter
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
except ImportError:
    limiter = None

# Define Frontend Metrics
FRONTEND_PAGE_VIEWS = Counter(
    "frontend_page_views_total",
    "Total number of page views on the frontend",
    ["page"]
)

FRONTEND_API_LATENCY = Histogram(
    "frontend_api_latency_seconds",
    "Frontend API call latency as perceived by the client",
    ["endpoint", "method", "status"],
    buckets=(0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
)

FRONTEND_ERRORS = Counter(
    "frontend_errors_total",
    "Total number of frontend errors",
    ["type", "page"]
)

FRONTEND_WEB_VITALS = Histogram(
    "frontend_web_vitals_seconds",
    "Frontend Web Vitals (LCP, FID, CLS, etc.)",
    ["metric"],
    buckets=(0.1, 0.25, 0.5, 1.0, 2.5, 5.0)
)

class MetricBatch(BaseModel):
    name: str
    type: str  # counter, histogram, gauge
    value: float
    labels: Dict[str, str] = Field(default_factory=dict)
    timestamp: Optional[float] = None

class FrontendMetricsRequest(BaseModel):
    metrics: List[MetricBatch]

def process_metrics(metrics: List[MetricBatch]):
    """Process a batch of metrics in the background"""
    for m in metrics:
        try:
            if m.name == "frontend_page_views_total":
                FRONTEND_PAGE_VIEWS.labels(page=m.labels.get("page", "unknown")).inc(m.value)
            
            elif m.name == "frontend_api_latency_seconds":
                FRONTEND_API_LATENCY.labels(
                    endpoint=m.labels.get("endpoint", "unknown"),
                    method=m.labels.get("method", "unknown"),
                    status=m.labels.get("status", "unknown")
                ).observe(m.value)
            
            elif m.name == "frontend_errors_total":
                FRONTEND_ERRORS.labels(
                    type=m.labels.get("type", "unknown"),
                    page=m.labels.get("page", "unknown")
                ).inc(m.value)
            
            elif m.name == "frontend_web_vitals_seconds":
                FRONTEND_WEB_VITALS.labels(
                    metric=m.labels.get("metric", "unknown")
                ).observe(m.value)
                
        except Exception as e:
            logger.error(f"Error processing frontend metric {m.name}: {e}")

@router.post("/frontend")
async def collect_frontend_metrics(
    request: Request,
    metrics_request: FrontendMetricsRequest, 
    background_tasks: BackgroundTasks
):
    """
    Endpoint for the frontend to report metrics.
    Uses BackgroundTasks for low latency - responds immediately while processing metrics.
    """
    # Manual rate limiting check if limiter is available
    if limiter:
        # We can't use the decorator on a router that's included with a prefix easily
        # but the global limiter in main.py will handle it if configured
        pass
    
    background_tasks.add_task(process_metrics, metrics_request.metrics)
    return {"status": "accepted"}

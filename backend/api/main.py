from fastapi import FastAPI, Request, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import uuid
import time
import logging

# Explicit imports to avoid potential package resolution issues
from app.api.routers import voice
from app.api.routers import profile
from app.api.routers import dashboard
from app.api.routers import health
from app.api.routers import auth
from app.api.routers import metrics
from app.api.routers import websocket as ws_router
from app.core.config import get_settings
import asyncio
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables explicitly
load_dotenv()

SLOWAPI_AVAILABLE = False
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    SLOWAPI_AVAILABLE = True
except ImportError:
    Limiter = None  # type: ignore
    _rate_limit_exceeded_handler = None  # type: ignore
    get_remote_address = None  # type: ignore
    RateLimitExceeded = None  # type: ignore

settings = get_settings()

# Initialize Sentry
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        traces_sample_rate=settings.sentry_traces_sample_rate,
        profiles_sample_rate=settings.sentry_profiles_sample_rate,
        integrations=[FastApiIntegration()],
    )
    logger.info("✅ Sentry initialized")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Application is starting up...")
    
    yield
    # Shutdown
    logger.info("Application is shutting down...")
    # Give any background tasks a moment to clean up
    await asyncio.sleep(1)

app = FastAPI(
    title="Voice AI Backend",
    docs_url="/docs" if settings.api_docs_enabled else None,
    redoc_url="/redoc" if settings.api_docs_enabled else None,
    lifespan=lifespan,
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "request_id": request.state.request_id if hasattr(request.state, "request_id") else None},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "request_id": request.state.request_id if hasattr(request.state, "request_id") else None},
    )

# Initialize Prometheus Instrumentator - MUST be done before any routers or middleware
# This ensures the /metrics endpoint is available at the root level
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    # Create instrumentator with proper configuration
    instrumentator = Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        should_respect_env_var=False,  # Always enable for now
        should_instrument_requests_inprogress=True,
        excluded_handlers=["/health", "/health/live", "/health/ready"],  # Exclude health checks
    )
    # Instrument the app and expose metrics at root level
    instrumentator.instrument(app).expose(app, endpoint="/metrics", tags=["monitoring"])
    logger.info("✅ Prometheus metrics instrumentation initialized at /metrics")
except ImportError:
    logger.warning("⚠️ prometheus-fastapi-instrumentator not found, metrics endpoint disabled")
except Exception as e:
    logger.error(f"❌ Failed to initialize Prometheus metrics: {e}")

# API Versioning prefix
api_v1_router = APIRouter(prefix="/api/v1")

# Initialize Rate Limiter if available
if SLOWAPI_AVAILABLE and Limiter is not None and get_remote_address is not None:
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    if RateLimitExceeded is not None and _rate_limit_exceeded_handler is not None:
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

# GZIP Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware("http")
async def log_all_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code} for {request.method} {request.url.path}")
        return response
    except Exception as e:
        logger.error(f"Error processing {request.method} {request.url.path}: {e}")
        raise

@app.middleware("http")
async def log_websocket_handshake(request: Request, call_next):
    if request.headers.get("upgrade", "").lower() == "websocket":
        logger.info(f"WS Handshake: {request.url.path} - Headers: {dict(request.headers)}")
    return await call_next(request)

@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # Skip security headers for OPTIONS requests to avoid interfering with CORS preflight
    if request.method == "OPTIONS":
        return await call_next(request)
        
    # Skip strict headers for WebSocket upgrades
    if request.headers.get("upgrade", "").lower() == "websocket":
        return await call_next(request)
        
    response = await call_next(request)
    
    # Security Headers - all enabled for production security
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(self), camera=()"
    
    # Content Security Policy - adjust based on your frontend needs
    if not request.url.path.startswith("/docs") and not request.url.path.startswith("/redoc"):
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    
    return response

@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    # Immediate bypass for CORS preflight
    if request.method == "OPTIONS":
        return await call_next(request)

    response = await call_next(request)

    path = request.url.path
    method = request.method.upper()

    if method != "GET":
        cache_control = "no-store"
    elif path == "/dashboard/stats":
        # Dashboard stats - 10s cache, stale while revalidate for 60s
        cache_control = "private, max-age=10, stale-while-revalidate=60, must-revalidate"
    elif path.startswith("/api/profile"):
        # Profile - 15 min cache, stale while revalidate for 30 min
        cache_control = "private, max-age=900, stale-while-revalidate=1800, must-revalidate"
    elif path.startswith("/api/voice-settings"):
        # Voice settings - 5 min cache, stale while revalidate for 15 min
        cache_control = "private, max-age=300, stale-while-revalidate=900, must-revalidate"
    elif path.startswith("/api/business-setup"):
        # Business setup - 15 min cache, stale while revalidate for 30 min
        cache_control = "private, max-age=900, stale-while-revalidate=1800, must-revalidate"
    elif path.startswith("/api/voices"):
        # Voices - 30 min cache, stale while revalidate for 1 hour
        cache_control = "public, max-age=1800, stale-while-revalidate=3600, must-revalidate"
    elif path == "/health":
        cache_control = "no-cache, must-revalidate"
    else:
        cache_control = "private, no-cache, must-revalidate"

    response.headers.setdefault("Cache-Control", cache_control)

    # Improve Vary header with proper ordering
    vary = response.headers.get("Vary", "")
    vary_values = [v.strip() for v in vary.split(",") if v.strip()] if vary else []
    for v in ("Authorization", "Accept-Encoding"):
        if v not in vary_values:
            vary_values.append(v)
    response.headers["Vary"] = ", ".join(vary_values)

    # Add additional performance headers
    # if "X-Content-Type-Options" not in response.headers:
    #     response.headers["X-Content-Type-Options"] = "nosniff"

    return response

# CORS configuration - MUST be added last to be the outermost middleware
# and process requests first (important for OPTIONS preflight)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def bypass_cloudflared_warning(request: Request, call_next):
    response = await call_next(request)
    response.headers["cf-skip-browser-warning"] = "true"
    response.headers["ngrok-skip-browser-warning"] = "true"
    return response

# Include Routers
try:
    api_v1_router.include_router(auth.router, prefix="/auth")
    api_v1_router.include_router(voice.router)
    api_v1_router.include_router(profile.router)
    api_v1_router.include_router(dashboard.router)
    api_v1_router.include_router(health.router)
    api_v1_router.include_router(metrics.router)
    api_v1_router.include_router(ws_router.router)
    
    # Register V1 router
    app.include_router(api_v1_router)
    
    # Legacy /api support (for backward compatibility)
    app.include_router(auth.router, prefix="/api/auth")
    app.include_router(voice.router, prefix="/api") 
    app.include_router(profile.router, prefix="/api") 
    app.include_router(dashboard.router, prefix="/api") 
    app.include_router(health.router, prefix="/api")
    app.include_router(metrics.router, prefix="/api")
    app.include_router(ws_router.router, prefix="/api")
except Exception as e:
    logger.critical(f"Failed to load core routers: {e}", exc_info=True)
    # In a real production app, you might want to exit here
    # sys.exit(1)

try:
    from app.api.routers import business_setup
    app.include_router(business_setup.router, prefix="/api", tags=["business"])
    logger.info("✅ Business setup router loaded")
except Exception as e:
    logger.error(f"Failed to load business_setup router: {e}")

try:
    from app.api.routers import phone_numbers
    app.include_router(phone_numbers.router, prefix="/api", tags=["phone-numbers"])
    logger.info("✅ Phone numbers router loaded")
except Exception as e:
    logger.error(f"Failed to load phone_numbers router: {e}")

try:
    from app.api.routers import voice_settings
    app.include_router(voice_settings.router, prefix="/api", tags=["voice-settings"])
    logger.info("✅ Voice settings router loaded")
except Exception as e:
    logger.error(f"Failed to load voice_settings router: {e}")

try:
    from app.api.routers import subaccounts
    app.include_router(subaccounts.router, prefix="/api", tags=["subaccounts"])
    logger.info("✅ Subaccounts router loaded")
except Exception as e:
    logger.error(f"Failed to load subaccounts router: {e}")

# Direct alias for frontend calls that skip the /api/v1 prefix
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(metrics.router, prefix="/metrics", tags=["metrics"])

@app.get("/")
async def root():
    return {"message": "Voice AI API is running"}

@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint.
    Returns status of all critical dependencies.
    """
    import redis as sync_redis
    
    health_status = {
        "status": "ok", 
        "version": "1.0.0", 
        "environment": settings.environment,
        "dependencies": {}
    }
    
    # Check Supabase configuration
    try:
        if settings.supabase_url and settings.supabase_key:
            health_status["dependencies"]["supabase_config"] = "ok"
        else:
            health_status["dependencies"]["supabase_config"] = "missing"
            health_status["status"] = "degraded"
    except Exception:
        health_status["dependencies"]["supabase_config"] = "error"
        health_status["status"] = "degraded"

    # Check Redis connection (sync for simplicity in health check)
    try:
        redis_client = sync_redis.from_url(settings.redis_url, socket_timeout=2.0)
        redis_client.ping()
        health_status["dependencies"]["redis"] = "ok"
        redis_client.close()
    except Exception as e:
        logger.warning(f"Redis health check failed: {type(e).__name__}")
        health_status["dependencies"]["redis"] = "error"
        health_status["status"] = "degraded"

    # Check AI services configuration (not connectivity - that would be slow)
    ai_services = {
        "deepgram": settings.deepgram_api_key is not None,
        "openai": settings.openai_api_key is not None,
        "elevenlabs": settings.elevenlabs_api_key is not None,
        "twilio": settings.twilio_account_sid is not None,
    }
    
    configured_services = [k for k, v in ai_services.items() if v]
    health_status["dependencies"]["ai_services"] = {
        "configured": configured_services,
        "count": len(configured_services)
    }

    # Check Sentry
    health_status["dependencies"]["monitoring"] = "ok" if settings.sentry_dsn else "not_configured"

    return health_status


@app.get("/health/live")
async def liveness_check():
    """Simple liveness probe - just checks if the app is running"""
    return {"status": "alive"}


@app.get("/health/ready")
async def readiness_check():
    """
    Readiness probe - checks if app is ready to accept traffic.
    Returns 503 if critical dependencies are down.
    """
    import redis as sync_redis
    
    # Check Redis (critical for call handling)
    try:
        redis_client = sync_redis.from_url(settings.redis_url, socket_timeout=2.0)
        redis_client.ping()
        redis_client.close()
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "reason": "redis_unavailable"}
        )
    
    # Check Supabase config (critical)
    if not settings.supabase_url or not settings.supabase_key:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "reason": "database_not_configured"}
        )
    
    return {"status": "ready"}



if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to bind to all interfaces for Docker
    # Reload should only be True in development
    is_dev = settings.environment.lower() == "development"
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=settings.port, 
        reload=is_dev,
        log_level="info"
    )

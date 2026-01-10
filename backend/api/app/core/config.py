# app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import field_validator, SecretStr
from functools import lru_cache
from typing import Optional
import logging
import sys

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings with validation."""
    
    # ===========================================
    # REQUIRED - App will fail without these
    # ===========================================
    supabase_url: str
    supabase_key: SecretStr  # SecretStr hides value in logs
    supabase_service_key: SecretStr
    
    # ===========================================
    # OPTIONAL - With sensible defaults
    # ===========================================
    supabase_jwt_secret: Optional[SecretStr] = None
    port: int = 8080
    environment: str = "development"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # AI Services (Optional based on features used)
    deepgram_api_key: Optional[SecretStr] = None
    openai_api_key: Optional[SecretStr] = None
    together_api_key: Optional[SecretStr] = None
    elevenlabs_api_key: Optional[SecretStr] = None
    replicate_api_token: Optional[SecretStr] = None
    replicate_model_version: Optional[str] = None
    
    # Twilio
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[SecretStr] = None
    twilio_verify_service_sid: Optional[str] = None
    
    # Server
    base_url: Optional[str] = None
    go_gateway_url: Optional[str] = None
    fallback_user_id: Optional[str] = None
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    sentry_traces_sample_rate: float = 0.1
    sentry_profiles_sample_rate: float = 0.1
    
    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://float-portable-health-material.trycloudflare.com"
    ]
    
    # API Docs - Disabled by default for production
    api_docs_enabled: bool = False
    
    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[SecretStr] = None

    # ===========================================
    # VALIDATORS
    # ===========================================
    
    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"environment must be one of {allowed}")
        return v

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse comma-separated string, JSON list, or list."""
        if isinstance(v, str):
            if not v or v == '["*"]':
                return []
            # Try to parse as JSON first (common in Pydantic settings for lists)
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
            
            # Fallback to comma-separated
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("sentry_traces_sample_rate", "sentry_profiles_sample_rate")
    @classmethod
    def validate_sample_rate(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError("Sample rate must be between 0.0 and 1.0")
        return v

    # ===========================================
    # PROPERTIES
    # ===========================================
    
    @property
    def is_production(self) -> bool:
        return self.environment == "production"
    
    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    # ===========================================
    # CONFIG
    # ===========================================
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


def validate_required_settings(settings: Settings) -> list[str]:
    """Validate settings based on environment."""
    errors = []
    
    # Always required
    if not settings.supabase_url:
        errors.append("SUPABASE_URL is required")
    if not settings.supabase_key:
        errors.append("SUPABASE_KEY is required")
    if not settings.supabase_service_key:
        errors.append("SUPABASE_SERVICE_KEY is required")
    
    # Production requirements
    if settings.is_production:
        if not settings.cors_origins:
            errors.append("CORS_ORIGINS must be explicitly set in production")
        if "*" in settings.cors_origins:
            errors.append("CORS_ORIGINS cannot be '*' in production")
        if settings.api_docs_enabled:
            errors.append("API_DOCS_ENABLED should be false in production")
        if not settings.sentry_dsn:
            errors.append("SENTRY_DSN recommended for production")
    
    # Feature-specific validation
    # Add based on which features are enabled
    
    return errors


def log_settings_summary(settings: Settings) -> None:
    """Log safe summary of settings (no secrets)."""
    logger.info(
        "Configuration loaded",
        extra={
            "environment": settings.environment,
            "port": settings.port,
            "supabase_configured": bool(settings.supabase_url),
            "deepgram_configured": settings.deepgram_api_key is not None,
            "together_configured": settings.together_api_key is not None,
            "elevenlabs_configured": settings.elevenlabs_api_key is not None,
            "twilio_configured": settings.twilio_account_sid is not None,
            "sentry_configured": settings.sentry_dsn is not None,
            "cors_origins_count": len(settings.cors_origins),
            "api_docs_enabled": settings.api_docs_enabled,
        }
    )


@lru_cache()
def get_settings() -> Settings:
    """Load and validate settings. Fails fast on critical errors."""
    try:
        settings = Settings()
    except Exception as e:
        logger.critical(f"Failed to load settings: {e}")
        sys.exit(1)
    
    # Validate
    errors = validate_required_settings(settings)
    
    if errors:
        for error in errors:
            logger.error(f"Configuration error: {error}")
        
        # In production, fail fast
        if settings.is_production:
            logger.critical("Cannot start with configuration errors in production")
            sys.exit(1)
        else:
            logger.warning("Starting with configuration warnings (development mode)")
    
    # Log safe summary
    log_settings_summary(settings)
    
    return settings


# ===========================================
# HELPER FOR ACCESSING SECRET VALUES
# ===========================================

def get_secret_value(secret: Optional[SecretStr]) -> Optional[str]:
    """Safely extract value from SecretStr."""
    if secret is None:
        return None
    return secret.get_secret_value()
from sqlalchemy import Column, String, Boolean, DateTime, Text, Numeric, ForeignKey, Time
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    businesses = relationship("Business", back_populates="owner")
    phone_numbers = relationship("PhoneNumber", back_populates="owner", cascade="all, delete-orphan")

class PhoneNumber(Base):
    __tablename__ = "phone_numbers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    phone_number = Column(String, unique=True, nullable=False)
    friendly_name = Column(String)
    sid = Column(String)
    status = Column(String, default="active")
    capabilities = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="phone_numbers")

class Business(Base):
    __tablename__ = "businesses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    business_name = Column(String, nullable=False)
    category = Column(String)
    phone = Column(String)
    address = Column(Text)
    description = Column(Text)
    timezone = Column(String, default="America/New_York")
    subscription_status = Column(String, default="inactive")
    plan = Column(String, default="free")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="businesses")
    business_hours = relationship("BusinessHours", back_populates="business", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="business", cascade="all, delete-orphan")
    urgent_call_rules = relationship("UrgentCallRule", back_populates="business", cascade="all, delete-orphan")
    notification_settings = relationship("NotificationSettings", back_populates="business", uselist=False, cascade="all, delete-orphan")
    booking_requirements = relationship("BookingRequirement", back_populates="business", cascade="all, delete-orphan")

class BusinessHours(Base):
    __tablename__ = "business_hours"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String, nullable=False)  # 'monday', 'tuesday', etc.
    open_time = Column(Time)
    close_time = Column(Time)
    enabled = Column(Boolean, default=True)
    
    # Relationships
    business = relationship("Business", back_populates="business_hours")

class Service(Base):
    __tablename__ = "services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Numeric(10, 2))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    business = relationship("Business", back_populates="services")

class UrgentCallRule(Base):
    __tablename__ = "urgent_call_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    condition_text = Column(String, nullable=False)
    action = Column(String, nullable=False)
    contact = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    business = relationship("Business", back_populates="urgent_call_rules")

class NotificationSettings(Base):
    __tablename__ = "notification_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, unique=True)
    urgent_call_alerts = Column(Boolean, default=True)
    booking_confirmations = Column(Boolean, default=True)
    daily_summary = Column(Boolean, default=False)
    missed_call_alerts = Column(Boolean, default=True)
    owner_transfer_number = Column(String)
    store_transfer_number = Column(String)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    business = relationship("Business", back_populates="notification_settings")

class BookingRequirement(Base):
    __tablename__ = "booking_requirements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String, nullable=False)
    required = Column(Boolean, default=True)
    field_type = Column(String, nullable=False)  # 'text', 'email', 'phone', etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    business = relationship("Business", back_populates="booking_requirements")
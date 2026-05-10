from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class UserRole(str, Enum):
    elder = "elder"
    guardian = "guardian"
    caregiver = "caregiver"
    admin = "admin"


class ServiceType(str, Enum):
    door_check = "door_check"
    chat = "chat"
    companion = "companion"
    emergency = "emergency"


class OrderStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


# ===== User Schemas =====

class UserBase(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11, description="手机号")
    name: Optional[str] = Field(None, max_length=50)
    role: UserRole = UserRole.guardian


class UserCreate(UserBase):
    sms_code: str = Field(..., min_length=4, max_length=6, description="短信验证码")


class UserResponse(UserBase):
    id: uuid.UUID
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Auth Schemas =====

class SMSCodeRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===== Device Schemas =====

class DeviceCreate(BaseModel):
    elder_id: uuid.UUID
    device_token: str = Field(..., min_length=8, max_length=64)
    device_name: Optional[str] = None


class DeviceResponse(BaseModel):
    id: uuid.UUID
    elder_id: uuid.UUID
    device_token: str
    device_name: Optional[str]
    status: str
    last_seen: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class CSIReport(BaseModel):
    """CSI数据上报"""
    device_id: uuid.UUID
    activity_score: float = Field(..., ge=0, le=1)
    anomaly_score: Optional[float] = None
    raw_data: Optional[dict] = None


# ===== Family Schemas =====

class FamilyBind(BaseModel):
    guardian_id: uuid.UUID
    elder_id: uuid.UUID
    relationship: Optional[str] = Field(None, max_length=20)


class FamilyResponse(BaseModel):
    id: uuid.UUID
    elder: UserResponse
    guardian: UserResponse
    relationship: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Order Schemas =====

class OrderCreate(BaseModel):
    elder_id: uuid.UUID
    service_type: ServiceType
    scheduled_at: datetime
    notes: Optional[str] = Field(None, max_length=500)


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    caregiver_id: Optional[uuid.UUID] = None
    feedback: Optional[str] = Field(None, max_length=1000)
    photos: Optional[List[str]] = None
    location: Optional[dict] = None


class OrderResponse(BaseModel):
    id: uuid.UUID
    elder_id: uuid.UUID
    guardian_id: uuid.UUID
    caregiver_id: Optional[uuid.UUID]
    service_type: ServiceType
    status: OrderStatus
    scheduled_at: datetime
    completed_at: Optional[datetime]
    feedback: Optional[str]
    photos: Optional[List[str]]
    price: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ===== AI & Activity Schemas =====

class ActivitySummary(BaseModel):
    """活动摘要"""
    wake_time: Optional[str] = None
    sleep_time: Optional[str] = None
    activity_score: int = Field(..., ge=0, le=100)
    anomaly_detected: bool = False
    hourly_data: Optional[List[dict]] = None


class HealthReport(BaseModel):
    """健康日报"""
    user_id: uuid.UUID
    date: str
    summary: ActivitySummary
    ai_insights: Optional[List[str]] = None
    services_today: Optional[List[dict]] = None

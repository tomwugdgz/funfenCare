from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.db.session import Base


class WifiDevice(Base):
    """WiFi体感设备模型"""
    __tablename__ = "wifi_devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    elder_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    device_token = Column(String(64), unique=True, nullable=False, index=True)
    device_name = Column(String(100), nullable=True)
    status = Column(String(20), default="online")  # online/offline/error
    last_seen = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WifiDevice {self.device_token}>"


class CSIActivity(Base):
    """CSI活动数据模型（时序数据）"""
    __tablename__ = "csi_activity"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(UUID(as_uuid=True), ForeignKey("wifi_devices.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    activity_score = Column(Float, nullable=False)  # 0-1 活动强度
    anomaly_score = Column(Float, nullable=True)    # 异常分数
    raw_data = Column(JSONB, nullable=True)         # 原始CSI数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AIUserProfile(Base):
    """AI用户画像模型"""
    __tablename__ = "ai_user_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    wake_time_avg = Column(String(10), nullable=True)       # 平均起床时间
    sleep_time_avg = Column(String(10), nullable=True)      # 平均入睡时间
    activity_pattern = Column(JSONB, nullable=True)         # 活动模式
    interests = Column(JSONB, nullable=True)                # 兴趣标签 ["戏曲", "书法"]
    health_notes = Column(String(500), nullable=True)       # 健康备注
    emergency_contacts = Column(JSONB, nullable=True)       # 紧急联系人
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

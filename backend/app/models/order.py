from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.db.session import Base


class ServiceOrder(Base):
    """服务订单模型"""
    __tablename__ = "service_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    elder_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    guardian_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    service_type = Column(String(20), nullable=False)  # door_check/chat/companion/emergency
    status = Column(String(20), default="pending")     # pending/accepted/in_progress/completed/cancelled
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    feedback = Column(String(1000), nullable=True)
    photos = Column(JSONB, nullable=True)              # 现场照片URL列表
    location = Column(JSONB, nullable=True)            # GPS位置 {"lat": x, "lng": y}
    price = Column(Float, nullable=True)               # 服务费用
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ServiceOrder {self.id} {self.service_type}>"

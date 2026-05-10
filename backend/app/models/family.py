from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.session import Base


class FamilyRelation(Base):
    """亲情关系模型"""
    __tablename__ = "family_relations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    elder_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    guardian_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    relationship = Column(String(20), nullable=True)  # 子女/配偶/其他
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<FamilyRelation {self.guardian_id} -> {self.elder_id}>"

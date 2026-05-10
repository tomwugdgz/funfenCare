from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.session import Base


class User(Base):
    """用户模型"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(50), nullable=True)
    role = Column(
        Enum("elder", "guardian", "caregiver", "admin", name="user_role"),
        nullable=False,
        default="guardian"
    )
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User {self.phone}>"

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)
    prev_hash = Column(String, nullable=True)
    record_hash = Column(String, nullable=False)

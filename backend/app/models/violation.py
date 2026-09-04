from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    rule_id = Column(String, nullable=False)
    citation = Column(String, nullable=False)
    severity = Column(String, default="critical")  # critical, moderate, minor
    measured_value = Column(String, nullable=True)
    required_value = Column(String, nullable=True)
    violation_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

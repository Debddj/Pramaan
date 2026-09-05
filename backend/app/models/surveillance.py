from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base


class SurveillanceResult(Base):
    __tablename__ = "surveillance_results"

    id = Column(Integer, primary_key=True, index=True)
    listing_url = Column(String, nullable=False)
    marketplace = Column(String)  # "amazon" | "flipkart"
    product_title = Column(String)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=True)
    status = Column(String)  # "compliant" | "violation"
    violations_count = Column(Integer, default=0)
    scraped_at = Column(DateTime, default=datetime.utcnow)

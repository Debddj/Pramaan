from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from datetime import datetime
from app.core.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_uuid = Column(String, unique=True, index=True, nullable=False)
    officer_id = Column(Integer, nullable=True)
    barcode = Column(String, index=True, nullable=True)
    image_path = Column(String, nullable=True)
    image_hash_sha256 = Column(String, nullable=True)
    image_data_base64 = Column(Text, nullable=True)
    
    # Optical calibration telemetry
    detected_barcode_width_px = Column(Float, nullable=True)
    scale_factor_mm_per_px = Column(Float, nullable=True)
    pdp_area_sq_cm = Column(Float, nullable=True)
    measured_numeral_height_mm = Column(Float, nullable=True)
    
    # AI Extraction confidence
    extraction_confidence = Column(Float, default=1.0)
    status = Column(String, default="compliant")  # compliant, violation, under_review, exempt
    needs_review = Column(Boolean, default=False)
    review_notes = Column(Text, nullable=True)
    
    extracted_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

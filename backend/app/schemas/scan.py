from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScanRequest(BaseModel):
    barcode: Optional[str] = "8901030000001"
    pdp_area_sq_cm: Optional[float] = 150.0
    detected_barcode_width_px: Optional[float] = 745.8
    detected_text_height_px: Optional[float] = 36.0
    category: Optional[str] = "biscuits"
    raw_ocr_text: Optional[str] = None
    image_base64: Optional[str] = None

class LabelDeclaration(BaseModel):
    manufacturer_name: Optional[str] = None
    manufacturer_address: Optional[str] = None
    generic_name: Optional[str] = None
    net_quantity_value: Optional[float] = None
    net_quantity_unit: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    mrp: Optional[float] = None
    currency: Optional[str] = "INR"
    is_mrp_inclusive_of_taxes: Optional[bool] = True
    consumer_care_email: Optional[str] = None
    consumer_care_phone: Optional[str] = None
    consumer_care_address: Optional[str] = None
    country_of_origin: Optional[str] = "India"
    raw_ocr_text: Optional[str] = None

class ViolationOut(BaseModel):
    rule_id: str
    citation: str
    severity: str
    measured_value: Optional[str] = None
    required_value: Optional[str] = None
    violation_text: str

class ScanResult(BaseModel):
    scan_uuid: str
    barcode: Optional[str] = None
    status: str
    overall_confidence: float
    needs_review: bool
    is_calibrated: bool = False
    calibration_status: str = "uncalibrated"
    is_checksum_valid: Optional[bool] = None
    calibration_note: Optional[str] = None
    scale_factor_mm_per_px: Optional[float] = None
    pdp_area_sq_cm: Optional[float] = None
    measured_numeral_height_mm: Optional[float] = None
    extracted_declarations: LabelDeclaration
    violations: List[ViolationOut] = []
    sha256_hash: Optional[str] = None
    image_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ReviewAction(BaseModel):
    scan_uuid: str
    adjudication: str
    notes: Optional[str] = None
    corrected_height_mm: Optional[float] = None

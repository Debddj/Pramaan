import math
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScanRequest(BaseModel):
    barcode: Optional[str] = None
    pdp_area_sq_cm: Optional[float] = Field(None, gt=0, le=50000)
    detected_barcode_width_px: Optional[float] = Field(None, gt=0, le=10000)
    detected_text_height_px: Optional[float] = Field(None, gt=0, le=5000)
    category: Optional[str] = None
    raw_ocr_text: Optional[str] = None
    image_base64: Optional[str] = None

    @field_validator("pdp_area_sq_cm", "detected_barcode_width_px", "detected_text_height_px", mode="before")
    @classmethod
    def validate_finite_floats(cls, v):
        if v is not None and isinstance(v, (int, float)):
            if math.isnan(v) or math.isinf(v):
                raise ValueError("Measurement value must be a finite number")
        return v

class LabelDeclaration(BaseModel):
    manufacturer_name: Optional[str] = None
    manufacturer_address: Optional[str] = None
    generic_name: Optional[str] = None
    net_quantity_value: Optional[float] = Field(None, gt=0, le=100000)
    net_quantity_unit: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    mrp: Optional[float] = Field(None, ge=0, le=10000000)
    currency: Optional[str] = "INR"
    is_mrp_inclusive_of_taxes: Optional[bool] = True
    consumer_care_name: Optional[str] = None
    consumer_care_email: Optional[str] = None
    consumer_care_phone: Optional[str] = None
    consumer_care_address: Optional[str] = None
    country_of_origin: Optional[str] = "India"
    raw_ocr_text: Optional[str] = None

    @field_validator("net_quantity_value", "mrp", mode="before")
    @classmethod
    def validate_finite_decl(cls, v):
        if v is not None and isinstance(v, (int, float)):
            if math.isnan(v) or math.isinf(v):
                raise ValueError("Declaration numeric value must be finite")
        return v

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
    authoritative_cv: bool = False
    is_duplicate: bool = False
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

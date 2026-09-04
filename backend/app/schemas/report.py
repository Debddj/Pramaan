from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.scan import ViolationOut, LabelDeclaration

class LegalNoticeReport(BaseModel):
    notice_number: str
    scan_uuid: str
    timestamp: datetime
    product_name: str
    manufacturer: str
    barcode: str
    status: str
    violations: List[ViolationOut]
    declarations: LabelDeclaration
    measured_font_height_mm: Optional[float]
    required_font_height_mm: Optional[float]
    pdp_area_sq_cm: Optional[float]
    sha256_evidence_hash: str
    inspecting_officer_badge: str

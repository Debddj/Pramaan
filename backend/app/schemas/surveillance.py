from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.scan import ViolationOut


class ListingItem(BaseModel):
    listing_id: str
    title: str
    marketplace: str
    listing_url: str
    seller: str
    price: float
    category: str
    sample_ocr_text: str


class SurveillanceScanRequest(BaseModel):
    listing_id: Optional[str] = None
    listing_url: Optional[str] = None


class SurveillanceScanResponse(BaseModel):
    listing_url: str
    marketplace: str
    product_title: str
    status: str
    violations: List[ViolationOut]
    compliance_score: float
    scanned_at: datetime

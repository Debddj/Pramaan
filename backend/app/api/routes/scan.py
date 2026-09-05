import uuid
import hashlib
import base64
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.violation import Violation
from app.schemas.scan import ScanRequest, ScanResult, LabelDeclaration, ViolationOut
from app.services.preprocessing.barcode_calibration import calibrator
from app.services.extraction.document_ai import document_ai
from app.services.extraction.field_parser import entity_parser
from app.services.classification.category_classifier import classify_commodity_category
from app.services.rules_engine.engine import engine_instance
from app.core.config import settings

router = APIRouter()


def _compute_extraction_confidence(decl: LabelDeclaration) -> float:
    """
    Derives a 0.0-1.0 confidence score from how many expected label fields
    were actually extracted.  This replaces the old hardcoded 0.94 / 0.76.
    """
    expected_fields = [
        decl.manufacturer_name,
        decl.manufacturer_address,
        decl.generic_name,
        decl.net_quantity_value,
        decl.net_quantity_unit,
        decl.mfg_date,
        decl.mrp,
        decl.consumer_care_email or decl.consumer_care_phone,
    ]
    filled = sum(1 for f in expected_fields if f is not None and f != "")
    return round(filled / len(expected_fields), 2)


@router.post("/scan", response_model=ScanResult)
def process_scan(
    request: ScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan_uuid = f"PRM-{uuid.uuid4().hex[:8].upper()}"

    # 1. Barcode & Telemetry
    detected_barcode_width_px = request.detected_barcode_width_px or 745.8
    detected_text_height_px = request.detected_text_height_px or 36.0
    pdp_area_sq_cm = request.pdp_area_sq_cm or 150.0
    barcode = request.barcode or "0000000000000"

    # 2. Barcode Optical Metrology Calibration
    scale_factor = calibrator.compute_scale_factor(detected_barcode_width_px)
    measured_height_mm = calibrator.measure_height_mm(detected_text_height_px, scale_factor)

    # 3. Entity Extraction — uses REAL input, never canned data
    if request.raw_ocr_text:
        # Client already ran OCR and sent the text
        extracted_decl = entity_parser.parse_text(request.raw_ocr_text)
        image_bytes = b""
    elif request.image_base64:
        # Decode the actual uploaded image and run extraction
        try:
            image_bytes = base64.b64decode(request.image_base64)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
        extracted_decl = document_ai.extract_from_image(image_bytes, barcode=barcode)
    else:
        # No input provided — return empty extraction (honest)
        extracted_decl = LabelDeclaration()
        image_bytes = b""

    # Hash the actual image content (or empty if none)
    sha256_hash = hashlib.sha256(image_bytes).hexdigest() if image_bytes else hashlib.sha256(scan_uuid.encode()).hexdigest()

    # 4. Rules Evaluation
    cat = request.category or classify_commodity_category(extracted_decl.generic_name or "")
    status_result, violations = engine_instance.evaluate(
        decl=extracted_decl,
        measured_height_mm=measured_height_mm,
        pdp_area_sq_cm=pdp_area_sq_cm,
        category=cat,
    )

    # 5. Confidence from real extraction quality
    overall_confidence = _compute_extraction_confidence(extracted_decl)
    needs_review = overall_confidence < settings.TRIAGE_CONFIDENCE_THRESHOLD

    # 6. Database Persistence
    db_scan = Scan(
        scan_uuid=scan_uuid,
        officer_id=current_user.id,
        barcode=barcode,
        image_hash_sha256=sha256_hash,
        detected_barcode_width_px=detected_barcode_width_px,
        scale_factor_mm_per_px=scale_factor,
        pdp_area_sq_cm=pdp_area_sq_cm,
        measured_numeral_height_mm=measured_height_mm,
        extraction_confidence=overall_confidence,
        status="under_review" if needs_review else status_result,
        needs_review=needs_review,
        extracted_data=extracted_decl.dict(),
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)

    for v in violations:
        db_v = Violation(
            scan_id=db_scan.id,
            rule_id=v.rule_id,
            citation=v.citation,
            severity=v.severity,
            measured_value=v.measured_value,
            required_value=v.required_value,
            violation_text=v.violation_text,
        )
        db.add(db_v)
    db.commit()

    return ScanResult(
        scan_uuid=scan_uuid,
        barcode=barcode,
        status="under_review" if needs_review else status_result,
        overall_confidence=overall_confidence,
        needs_review=needs_review,
        scale_factor_mm_per_px=scale_factor,
        pdp_area_sq_cm=pdp_area_sq_cm,
        measured_numeral_height_mm=measured_height_mm,
        extracted_declarations=extracted_decl,
        violations=violations,
        sha256_hash=sha256_hash,
    )

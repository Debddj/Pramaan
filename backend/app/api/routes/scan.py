import uuid
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
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

@router.post("/scan", response_model=ScanResult)
def process_scan(
    request: ScanRequest,
    db: Session = Depends(get_db)
):
    scan_uuid = f"PRM-{uuid.uuid4().hex[:8].upper()}"
    
    # 1. Barcode & Telemetry
    detected_barcode_width_px = request.detected_barcode_width_px or 745.8
    detected_text_height_px = request.detected_text_height_px or 36.0
    pdp_area_sq_cm = request.pdp_area_sq_cm or 150.0
    barcode = request.barcode or "8901030000001"
    
    sha256_hash = hashlib.sha256(scan_uuid.encode()).hexdigest()

    # 2. Barcode Optical Metrology Calibration
    scale_factor = calibrator.compute_scale_factor(detected_barcode_width_px)
    measured_height_mm = calibrator.measure_height_mm(detected_text_height_px, scale_factor)

    # 3. VLM / Heuristic Entity Extraction
    if request.raw_ocr_text:
        extracted_decl = entity_parser.parse_text(request.raw_ocr_text)
    else:
        extracted_decl = document_ai.extract_from_image(b"", barcode=barcode)

    # 4. Rules Evaluation
    cat = request.category or classify_commodity_category(extracted_decl.generic_name or "")
    status, violations = engine_instance.evaluate(
        decl=extracted_decl,
        measured_height_mm=measured_height_mm,
        pdp_area_sq_cm=pdp_area_sq_cm,
        category=cat
    )

    # 5. Dual-Tier Confidence Triage
    overall_confidence = 0.94 if status != "under_review" else 0.76
    needs_review = overall_confidence < settings.TRIAGE_CONFIDENCE_THRESHOLD

    # 6. Database Persistence
    db_scan = Scan(
        scan_uuid=scan_uuid,
        barcode=barcode,
        image_hash_sha256=sha256_hash,
        detected_barcode_width_px=detected_barcode_width_px,
        scale_factor_mm_per_px=scale_factor,
        pdp_area_sq_cm=pdp_area_sq_cm,
        measured_numeral_height_mm=measured_height_mm,
        extraction_confidence=overall_confidence,
        status="under_review" if needs_review else status,
        needs_review=needs_review,
        extracted_data=extracted_decl.dict()
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
            violation_text=v.violation_text
        )
        db.add(db_v)
    db.commit()

    return ScanResult(
        scan_uuid=scan_uuid,
        barcode=barcode,
        status="under_review" if needs_review else status,
        overall_confidence=overall_confidence,
        needs_review=needs_review,
        scale_factor_mm_per_px=scale_factor,
        pdp_area_sq_cm=pdp_area_sq_cm,
        measured_numeral_height_mm=measured_height_mm,
        extracted_declarations=extracted_decl,
        violations=violations,
        sha256_hash=sha256_hash
    )

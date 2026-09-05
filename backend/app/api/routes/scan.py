import uuid
import hashlib
import base64
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.violation import Violation
from app.schemas.scan import ScanRequest, ScanResult, LabelDeclaration, ViolationOut
from app.services.preprocessing.barcode_calibration import calibrator
from app.services.preprocessing.barcode_detector import barcode_detector
from app.services.preprocessing.quality_check import assess_image_quality
from app.services.extraction.document_ai import document_ai
from app.services.extraction.field_parser import entity_parser
from app.services.classification.category_classifier import classify_commodity_category
from app.services.rules_engine.engine import engine_instance
from app.services.storage.object_store import object_store
from app.services.audit.audit_service import audit_service
from app.middleware.rate_limiter import limiter
from app.core.config import settings

router = APIRouter()


def _compute_extraction_confidence(decl: LabelDeclaration) -> float:
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


def _process_scan_core(
    db: Session,
    current_user: User,
    image_bytes: bytes,
    raw_ocr_text: Optional[str] = None,
    client_barcode: Optional[str] = None,
    client_barcode_width_px: Optional[float] = None,
    client_text_height_px: Optional[float] = None,
    pdp_area_sq_cm: Optional[float] = None,
    category: Optional[str] = None,
) -> ScanResult:
    scan_uuid = f"PRM-{uuid.uuid4().hex[:8].upper()}"
    image_url: Optional[str] = None

    # 1. Image Storage & Content Hashing
    if image_bytes:
        record = object_store.store(image_bytes, ext="jpg")
        sha256_hash = record.sha256_hash
        image_url = record.path
    else:
        sha256_hash = hashlib.sha256(scan_uuid.encode()).hexdigest()

    # 2. Real Computer Vision Quality Assessment
    quality = assess_image_quality(image_bytes) if image_bytes else None

    # 3. Barcode Detection & Optical Calibration
    barcode = client_barcode or "0000000000000"
    detected_barcode_width_px = client_barcode_width_px or 745.8

    if image_bytes:
        detection = barcode_detector.detect(image_bytes)
        if detection:
            barcode = detection.barcode_data
            detected_barcode_width_px = detection.pixel_width

    pdp_area = pdp_area_sq_cm or 150.0
    scale_factor = calibrator.compute_scale_factor(detected_barcode_width_px)
    detected_text_height_px = client_text_height_px or 36.0
    measured_height_mm = calibrator.measure_height_mm(detected_text_height_px, scale_factor)

    # 4. Entity Extraction
    if raw_ocr_text:
        extracted_decl = entity_parser.parse_text(raw_ocr_text)
    elif image_bytes:
        extracted_decl = document_ai.extract_from_image(image_bytes, barcode=barcode)
    else:
        extracted_decl = LabelDeclaration()

    # 5. Rules Evaluation
    cat = category or classify_commodity_category(extracted_decl.generic_name or "")
    contrast_ratio = quality.contrast_ratio if quality else 4.5
    status_result, violations = engine_instance.evaluate(
        decl=extracted_decl,
        measured_height_mm=measured_height_mm,
        pdp_area_sq_cm=pdp_area,
        category=cat,
        contrast_ratio=contrast_ratio,
    )

    # 6. Confidence & Triage Assessment
    overall_confidence = _compute_extraction_confidence(extracted_decl)
    needs_review = (overall_confidence < settings.TRIAGE_CONFIDENCE_THRESHOLD) or (
        quality is not None and not quality.is_acceptable
    )
    final_status = "under_review" if needs_review else status_result

    # 7. Database Persistence
    db_scan = Scan(
        scan_uuid=scan_uuid,
        officer_id=current_user.id,
        barcode=barcode,
        image_hash_sha256=sha256_hash,
        detected_barcode_width_px=detected_barcode_width_px,
        scale_factor_mm_per_px=scale_factor,
        pdp_area_sq_cm=pdp_area,
        measured_numeral_height_mm=measured_height_mm,
        extraction_confidence=overall_confidence,
        status=final_status,
        needs_review=needs_review,
        extracted_data=extracted_decl.model_dump(),
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

    # 8. Append-Only Audit Trail
    audit_service.log_action(
        db=db,
        officer_id=current_user.id,
        action="scan_created",
        entity_type="scan",
        entity_id=scan_uuid,
        after_state={
            "status": final_status,
            "confidence": overall_confidence,
            "violations_count": len(violations),
        },
    )

    return ScanResult(
        scan_uuid=scan_uuid,
        barcode=barcode,
        status=final_status,
        overall_confidence=overall_confidence,
        needs_review=needs_review,
        scale_factor_mm_per_px=scale_factor,
        pdp_area_sq_cm=pdp_area,
        measured_numeral_height_mm=measured_height_mm,
        extracted_declarations=extracted_decl,
        violations=violations,
        sha256_hash=sha256_hash,
        image_url=image_url,
    )


@router.post("/scan", response_model=ScanResult)
@limiter.limit("30/minute")
def process_scan(
    request: Request,
    scan_req: ScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_bytes = b""
    if scan_req.image_base64:
        try:
            image_bytes = base64.b64decode(scan_req.image_base64)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")

    return _process_scan_core(
        db=db,
        current_user=current_user,
        image_bytes=image_bytes,
        raw_ocr_text=scan_req.raw_ocr_text,
        client_barcode=scan_req.barcode,
        client_barcode_width_px=scan_req.detected_barcode_width_px,
        client_text_height_px=scan_req.detected_text_height_px,
        pdp_area_sq_cm=scan_req.pdp_area_sq_cm,
        category=scan_req.category,
    )


@router.post("/scan/upload", response_model=ScanResult)
@limiter.limit("10/minute")
async def process_scan_upload(
    request: Request,
    file: UploadFile = File(...),
    barcode: Optional[str] = Form(None),
    pdp_area_sq_cm: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    return _process_scan_core(
        db=db,
        current_user=current_user,
        image_bytes=image_bytes,
        client_barcode=barcode,
        pdp_area_sq_cm=pdp_area_sq_cm,
        category=category,
    )

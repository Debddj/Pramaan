import uuid
import hashlib
import base64
from datetime import datetime
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, cast, String
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.violation import Violation
from app.schemas.scan import ScanRequest, ScanResult, LabelDeclaration, ViolationOut
from app.services.preprocessing.barcode_calibration import calibrator
from app.services.preprocessing.barcode_detector import barcode_detector, validate_ean13_checksum
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


def _compute_composite_confidence(
    decl: LabelDeclaration,
    quality: Optional[Any],
    is_calibrated: bool,
    is_checksum_valid: Optional[bool],
) -> float:
    expected_fields = [
        decl.manufacturer_name,
        decl.manufacturer_address,
        decl.generic_name,
        decl.net_quantity_value,
        decl.net_quantity_unit,
        decl.mfg_date,
        decl.mrp,
    ]
    present = sum(1 for f in expected_fields if f is not None)
    field_score = present / len(expected_fields)

    # CV Quality score
    quality_score = 0.5
    if quality is not None:
        quality_score = 1.0 if quality.is_acceptable else 0.3
        if getattr(quality, "has_glare", False):
            quality_score -= 0.2
        if getattr(quality, "is_blurry", False):
            quality_score -= 0.3
        quality_score = max(0.1, min(1.0, quality_score))

    # Calibration & Checksum score
    if is_calibrated and is_checksum_valid is True:
        calib_score = 1.0
    elif is_calibrated:
        calib_score = 0.7
    else:
        calib_score = 0.2

    composite = (0.4 * field_score) + (0.3 * quality_score) + (0.3 * calib_score)
    return round(max(0.05, min(1.0, composite)), 2)


def _process_scan_core(
    db: Session,
    current_user: User,
    image_bytes: bytes = b"",
    raw_ocr_text: Optional[str] = None,
    client_barcode: Optional[str] = None,
    client_barcode_width_px: Optional[float] = None,
    client_text_height_px: Optional[float] = None,
    pdp_area_sq_cm: Optional[float] = None,
    category: Optional[str] = None,
) -> ScanResult:
    scan_uuid = f"PRM-{uuid.uuid4().hex[:8].upper()}"
    image_url: Optional[str] = None
    image_b64: Optional[str] = None
    authoritative_cv = bool(image_bytes and len(image_bytes) > 0)

    # 1. Image Storage & Content Hashing
    if image_bytes:
        record = object_store.store(image_bytes, ext="jpg")
        sha256_hash = record.sha256_hash
        image_url = record.data_uri or record.path
        image_b64 = record.base64_data

        # BUG-022: Idempotent duplicate check within 5 minutes
        recent_duplicate = (
            db.query(Scan)
            .filter(Scan.image_hash_sha256 == sha256_hash, Scan.officer_id == current_user.id)
            .order_by(Scan.id.desc())
            .first()
        )
        if recent_duplicate and (datetime.utcnow() - recent_duplicate.created_at).total_seconds() < 300:
            existing_violations = [
                ViolationOut(
                    rule_id=v.rule_id,
                    citation=v.citation,
                    severity=v.severity,
                    measured_value=v.measured_value,
                    required_value=v.required_value,
                    violation_text=v.violation_text,
                )
                for v in db.query(Violation).filter_by(scan_id=recent_duplicate.id).all()
            ]
            return ScanResult(
                scan_uuid=recent_duplicate.scan_uuid,
                barcode=recent_duplicate.barcode,
                status=recent_duplicate.status,
                overall_confidence=recent_duplicate.extraction_confidence or 0.0,
                needs_review=recent_duplicate.needs_review,
                is_calibrated=bool(recent_duplicate.scale_factor_mm_per_px),
                calibration_status="calibrated" if recent_duplicate.scale_factor_mm_per_px else "uncalibrated",
                is_checksum_valid=validate_ean13_checksum(recent_duplicate.barcode or ""),
                calibration_note="Duplicate inspection: cached evidence returned",
                authoritative_cv=bool(recent_duplicate.image_data_base64),
                is_duplicate=True,
                scale_factor_mm_per_px=recent_duplicate.scale_factor_mm_per_px,
                pdp_area_sq_cm=recent_duplicate.pdp_area_sq_cm,
                measured_numeral_height_mm=recent_duplicate.measured_numeral_height_mm,
                extracted_declarations=LabelDeclaration(**(recent_duplicate.extracted_data or {})),
                violations=existing_violations,
                sha256_hash=recent_duplicate.image_hash_sha256,
                image_url=recent_duplicate.image_path,
                timestamp=recent_duplicate.created_at,
            )
    else:
        sha256_hash = hashlib.sha256(scan_uuid.encode()).hexdigest()

    # 2. Real Computer Vision Quality Assessment
    quality = assess_image_quality(image_bytes) if image_bytes else None

    # 3. Barcode Detection & Optical Calibration
    barcode = client_barcode
    detected_barcode_width_px = client_barcode_width_px
    detected_text_height_px = client_text_height_px
    is_checksum_valid = None

    if image_bytes:
        detection = barcode_detector.detect(image_bytes)
        if detection:
            barcode = detection.barcode_data
            detected_barcode_width_px = detection.pixel_width
            is_checksum_valid = detection.is_checksum_valid

    if barcode and is_checksum_valid is None:
        is_checksum_valid = validate_ean13_checksum(barcode)

    # BUG-002 & BUG-004: Strict Metrology Enforcement
    is_calibrated = False
    calibration_status = "uncalibrated"
    calibration_note = None
    scale_factor = None
    measured_height_mm = None

    if detected_barcode_width_px and detected_barcode_width_px > 0:
        scale_factor = calibrator.compute_scale_factor(detected_barcode_width_px)

    if not authoritative_cv and not raw_ocr_text:
        # BUG-002: Client measurements without image cannot be authoritatively certified
        calibration_status = "uncalibrated"
        calibration_note = "Non-authoritative: no packaging image provided for server-side verification."
    elif is_checksum_valid is False:
        # BUG-004: Checksum failed -> Barcode rejected as physical reference ruler
        is_calibrated = False
        measured_height_mm = None
        calibration_status = "uncalibrated"
        calibration_note = "Barcode checksum validation failed: invalid EAN-13 check digit. Barcode rejected as physical reference ruler."
    elif scale_factor and scale_factor > 0:
        if detected_text_height_px and detected_text_height_px > 0:
            measured_height_mm = calibrator.measure_height_mm(detected_text_height_px, scale_factor)
            is_calibrated = True
            calibration_status = "calibrated"
        else:
            calibration_status = "partial"
            calibration_note = "Barcode standard detected, but net quantity numeral box was not isolated"
    else:
        calibration_status = "uncalibrated"
        calibration_note = "No standard EAN-13 barcode detected on packaging for optical calibration"


    pdp_area = pdp_area_sq_cm or 150.0

    # 4. Entity Extraction
    if raw_ocr_text:
        extracted_decl = entity_parser.parse_text(raw_ocr_text)
    elif image_bytes:
        extracted_decl = document_ai.extract_from_image(image_bytes, barcode=barcode or "")
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

    # 6. BUG-016: Calibrated Composite Confidence & Triage Assessment
    overall_confidence = _compute_composite_confidence(
        decl=extracted_decl,
        quality=quality,
        is_calibrated=is_calibrated,
        is_checksum_valid=is_checksum_valid,
    )
    needs_review = (
        (overall_confidence < settings.TRIAGE_CONFIDENCE_THRESHOLD)
        or (quality is not None and not quality.is_acceptable)
        or (not is_calibrated)
    )
    final_status = "under_review" if needs_review else status_result

    # 7. BUG-021: Atomic Database Persistence
    db_scan = Scan(
        scan_uuid=scan_uuid,
        officer_id=current_user.id,
        barcode=barcode,
        image_path=image_url,
        image_hash_sha256=sha256_hash,
        image_data_base64=image_b64,
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
    db.flush()

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

    # 8. Append-Only Audit Trail (atomic with transaction)
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
            "is_calibrated": is_calibrated,
        },
        commit=False,
    )
    db.commit()
    db.refresh(db_scan)

    return ScanResult(
        scan_uuid=scan_uuid,
        barcode=barcode,
        status=final_status,
        overall_confidence=overall_confidence,
        needs_review=needs_review,
        is_calibrated=is_calibrated,
        calibration_status=calibration_status,
        is_checksum_valid=is_checksum_valid,
        calibration_note=calibration_note,
        authoritative_cv=authoritative_cv,
        is_duplicate=False,
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


@router.get("/scans")
def list_and_search_scans(
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search and retrieval facility across all historically scanned packaged commodities.
    Supports filtering by search term (barcode, commodity, manufacturer, UUID),
    compliance status, and pagination.
    """
    page = max(1, page)
    limit = min(100, max(1, limit))

    query = db.query(Scan)

    if status and status.lower() not in ("all", ""):
        query = query.filter(Scan.status == status.lower())

    if q and q.strip():
        term = q.strip()
        search_filter = or_(
            Scan.scan_uuid.ilike(f"%{term}%"),
            Scan.barcode.ilike(f"%{term}%"),
            cast(Scan.extracted_data, String).ilike(f"%{term}%"),
        )
        query = query.filter(search_filter)

    total = query.count()
    scans = (
        query.order_by(Scan.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    items = []
    for s in scans:
        extracted = s.extracted_data or {}
        viol_count = db.query(Violation).filter(Violation.scan_id == s.id).count()
        items.append({
            "id": s.id,
            "scan_uuid": s.scan_uuid,
            "barcode": s.barcode or "N/A",
            "product": extracted.get("generic_name") or "Packaged Commodity",
            "manufacturer": extracted.get("manufacturer_name") or "Unknown Manufacturer",
            "status": s.status or "compliant",
            "confidence": s.extraction_confidence or 0.0,
            "pdp_area_sq_cm": s.pdp_area_sq_cm,
            "measured_numeral_height_mm": s.measured_numeral_height_mm,
            "violations_count": viol_count,
            "time": s.created_at.strftime("%H:%M:%S") if s.created_at else "",
            "created_at": s.created_at.isoformat() if s.created_at else "",
            "officer": current_user.full_name or "Authorized Officer",
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "scans": items,
    }


@router.get("/scans/{scan_uuid}", response_model=ScanResult)
def get_scan_by_uuid(
    scan_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves full inspection verdict, evidence parameters, and codified violations
    for a specific historical scan UUID.
    """
    scan = db.query(Scan).filter(Scan.scan_uuid == scan_uuid).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    db_violations = db.query(Violation).filter(Violation.scan_id == scan.id).all()
    violations = [
        ViolationOut(
            rule_id=v.rule_id,
            citation=v.citation,
            severity=v.severity,
            measured_value=v.measured_value,
            required_value=v.required_value,
            violation_text=v.violation_text,
        )
        for v in db_violations
    ]

    extracted_decl = LabelDeclaration(**(scan.extracted_data or {})) if scan.extracted_data else LabelDeclaration()

    return ScanResult(
        scan_uuid=scan.scan_uuid,
        barcode=scan.barcode,
        status=scan.status,
        overall_confidence=scan.extraction_confidence or 0.0,
        needs_review=scan.needs_review,
        is_calibrated=bool(scan.scale_factor_mm_per_px),
        calibration_status="calibrated" if scan.scale_factor_mm_per_px else "uncalibrated",
        is_checksum_valid=validate_ean13_checksum(scan.barcode or "") if scan.barcode else None,
        calibration_note="Retrieved from statutory inspection repository",
        authoritative_cv=bool(scan.image_data_base64),
        is_duplicate=False,
        scale_factor_mm_per_px=scan.scale_factor_mm_per_px,
        pdp_area_sq_cm=scan.pdp_area_sq_cm,
        measured_numeral_height_mm=scan.measured_numeral_height_mm,
        extracted_declarations=extracted_decl,
        violations=violations,
        sha256_hash=scan.image_hash_sha256,
        image_url=scan.image_path,
        timestamp=scan.created_at,
    )

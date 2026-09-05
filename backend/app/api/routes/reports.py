from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.violation import Violation as ViolationModel
from app.schemas.report import LegalNoticeReport
from app.schemas.scan import LabelDeclaration, ViolationOut
from app.services.reporting.pdf_generator import generate_pdf_report

router = APIRouter()

@router.get("/reports/{scan_uuid}/pdf")
def get_pdf_notice(
    scan_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = db.query(Scan).filter(Scan.scan_uuid == scan_uuid).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    # Reconstruct declarations from actual stored extraction data
    extracted = scan.extracted_data or {}
    decl = LabelDeclaration(**extracted) if extracted else LabelDeclaration()

    # Fetch real violations from the DB for this scan
    db_violations = db.query(ViolationModel).filter(ViolationModel.scan_id == scan.id).all()
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

    product_name = f"{decl.generic_name or 'Unknown Product'}"
    if decl.net_quantity_value and decl.net_quantity_unit:
        product_name += f" {decl.net_quantity_value}{decl.net_quantity_unit}"

    report = LegalNoticeReport(
        notice_number=f"NOTICE/DL/2026/{scan_uuid}",
        scan_uuid=scan_uuid,
        timestamp=scan.created_at or datetime.utcnow(),
        product_name=product_name,
        manufacturer=decl.manufacturer_name or "Unknown Manufacturer",
        barcode=scan.barcode or "N/A",
        status=scan.status,
        violations=violations,
        declarations=decl,
        measured_font_height_mm=scan.measured_numeral_height_mm,
        required_font_height_mm=None,  # Would need to re-derive from lookup
        pdp_area_sq_cm=scan.pdp_area_sq_cm,
        sha256_evidence_hash=scan.image_hash_sha256 or "N/A",
        inspecting_officer_badge=current_user.badge_number or "N/A",
    )

    pdf_bytes = generate_pdf_report(report)
    return Response(
        content=pdf_bytes,
        media_type="text/html",
        headers={"Content-Disposition": f"inline; filename=Notice_{scan_uuid}.html"},
    )

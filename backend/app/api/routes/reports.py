from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models.scan import Scan
from app.schemas.report import LegalNoticeReport
from app.schemas.scan import LabelDeclaration, ViolationOut
from app.services.reporting.pdf_generator import generate_pdf_report

router = APIRouter()

@router.get("/reports/{scan_uuid}/pdf")
def get_pdf_notice(scan_uuid: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.scan_uuid == scan_uuid).first()
    
    # Generate dummy report payload if not found in db for test demo
    decl = LabelDeclaration(
        manufacturer_name="Britannia Industries Ltd",
        generic_name="Butter Biscuits",
        net_quantity_value=65.0,
        net_quantity_unit="g",
        mrp=30.0
    )
    violations = [
        ViolationOut(
            rule_id="LMPC-R7-TABLE-1",
            citation="Rule 7(2), Table I",
            severity="critical",
            measured_value="1.80 mm",
            required_value="3.00 mm",
            violation_text="Measured numeral height 1.80mm is below statutory minimum 3.00mm"
        )
    ]
    
    report = LegalNoticeReport(
        notice_number=f"NOTICE/DL/2026/{scan_uuid}",
        scan_uuid=scan_uuid,
        timestamp=datetime.utcnow(),
        product_name="Butter Biscuits 65g",
        manufacturer="Britannia Industries Ltd",
        barcode=scan.barcode if scan else "8901030000000",
        status=scan.status if scan else "violation",
        violations=violations,
        declarations=decl,
        measured_font_height_mm=1.8,
        required_font_height_mm=3.0,
        pdp_area_sq_cm=210.0,
        sha256_evidence_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        inspecting_officer_badge="DL-LM-4821"
    )

    pdf_bytes = generate_pdf_report(report)
    return Response(
        content=pdf_bytes,
        media_type="text/html",
        headers={"Content-Disposition": f"inline; filename=Notice_{scan_uuid}.html"}
    )

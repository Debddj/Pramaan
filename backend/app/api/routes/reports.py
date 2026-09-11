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

    extracted = scan.extracted_data or {}
    decl = LabelDeclaration(**extracted) if extracted else LabelDeclaration()

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
        required_font_height_mm=None,
        pdp_area_sq_cm=scan.pdp_area_sq_cm,
        sha256_evidence_hash=scan.image_hash_sha256 or "N/A",
        inspecting_officer_badge=current_user.badge_number or "N/A",
    )

    doc_bytes = generate_pdf_report(report)
    is_pdf = doc_bytes.startswith(b"%PDF")
    media_type = "application/pdf" if is_pdf else "text/html"
    ext = "pdf" if is_pdf else "html"

    return Response(
        content=doc_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f"inline; filename=Notice_{scan_uuid}.{ext}"},
    )


@router.get("/reports/{scan_uuid}/csv")
def get_csv_report(
    scan_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Exports full statutory inspection findings and packaging declarations
    as an editable, standard CSV document compatible with Microsoft Excel and Google Sheets.
    """
    import csv
    import io

    scan = db.query(Scan).filter(Scan.scan_uuid == scan_uuid).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    extracted = scan.extracted_data or {}
    decl = LabelDeclaration(**extracted) if extracted else LabelDeclaration()
    db_violations = db.query(ViolationModel).filter(ViolationModel.scan_id == scan.id).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # 1. Statutory Header & Metadata
    writer.writerow(["PRAMAAN LEGAL METROLOGY STATUTORY INSPECTION REPORT", ""])
    writer.writerow(["Statute", "Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011"])
    writer.writerow(["Notice Reference", f"NOTICE/DL/2026/{scan_uuid}"])
    writer.writerow(["Inspection UUID", scan_uuid])
    writer.writerow(["Inspection Timestamp (UTC)", scan.created_at.isoformat() if scan.created_at else ""])
    writer.writerow(["Inspecting Officer Name", current_user.full_name or "Authorized Officer"])
    writer.writerow(["Inspecting Officer Badge", current_user.badge_number or "N/A"])
    writer.writerow(["Overall Compliance Status", (scan.status or "compliant").upper()])
    writer.writerow(["Extraction Confidence Score", f"{round((scan.extraction_confidence or 0.0) * 100, 1)}%"])
    writer.writerow(["Cryptographic SHA-256 Hash", scan.image_hash_sha256 or "N/A"])
    writer.writerow([])

    # 2. Packaging Declarations
    writer.writerow(["PACKAGING DECLARATION DATA", ""])
    writer.writerow(["Commodity Generic Name", decl.generic_name or "Packaged Commodity"])
    writer.writerow(["EAN-13 Barcode", scan.barcode or "N/A"])
    writer.writerow(["Manufacturer / Packer Name", decl.manufacturer_name or "Not declared"])
    writer.writerow(["Manufacturer Address", decl.manufacturer_address or "Not declared"])
    writer.writerow(["Declared Net Quantity", f"{decl.net_quantity_value or ''} {decl.net_quantity_unit or ''}".strip() or "Not declared"])
    writer.writerow(["Maximum Retail Price (INR)", f"{decl.mrp:.2f}" if decl.mrp is not None else "Not declared"])
    writer.writerow(["MRP Inclusive of Taxes", "Yes" if decl.is_mrp_inclusive_of_taxes else "No / Missing"])
    writer.writerow(["Manufacturing / Packing Date", decl.mfg_date or "Not declared"])
    writer.writerow(["Country of Origin", decl.country_of_origin or "Not declared"])
    writer.writerow(["Consumer Care Contact", f"{decl.consumer_care_name or ''} {decl.consumer_care_phone or ''} {decl.consumer_care_email or ''}".strip() or "Not declared"])
    writer.writerow(["Principal Display Panel Area (sq cm)", scan.pdp_area_sq_cm if scan.pdp_area_sq_cm else "N/A"])
    writer.writerow(["Measured Numeral Height (mm)", f"{scan.measured_numeral_height_mm:.2f}" if scan.measured_numeral_height_mm else "Uncalibrated"])
    writer.writerow([])

    # 3. Codified Violations
    writer.writerow(["CODIFIED STATUTORY INFRACTIONS", "", "", "", ""])
    writer.writerow(["Rule Citation", "Severity", "Details of Non-Compliance", "Measured Value", "Required Value"])
    if db_violations:
        for v in db_violations:
            writer.writerow([v.citation, v.severity.upper(), v.violation_text, v.measured_value, v.required_value])
    else:
        writer.writerow(["None", "COMPLIANT", "Full statutory compliance observed under LMPC Rules, 2011.", "N/A", "N/A"])

    csv_content = output.getvalue()
    return Response(
        content=csv_content.encode("utf-8-sig"),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Notice_{scan_uuid}.csv"},
    )


@router.get("/reports/{scan_uuid}/json")
def get_json_report(
    scan_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Exports full statutory inspection findings and declarations as structured, editable JSON.
    """
    import json

    scan = db.query(Scan).filter(Scan.scan_uuid == scan_uuid).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    extracted = scan.extracted_data or {}
    decl = LabelDeclaration(**extracted) if extracted else LabelDeclaration()
    db_violations = db.query(ViolationModel).filter(ViolationModel.scan_id == scan.id).all()

    report_dict = {
        "notice_number": f"NOTICE/DL/2026/{scan_uuid}",
        "scan_uuid": scan_uuid,
        "timestamp": scan.created_at.isoformat() if scan.created_at else None,
        "status": scan.status,
        "statute": "Legal Metrology Act, 2009 read with Legal Metrology (Packaged Commodities) Rules, 2011",
        "inspecting_officer": {
            "name": current_user.full_name or "Authorized Officer",
            "badge_number": current_user.badge_number or "N/A",
            "email": current_user.email,
        },
        "declarations": decl.model_dump(),
        "optical_metrology": {
            "measured_numeral_height_mm": scan.measured_numeral_height_mm,
            "pdp_area_sq_cm": scan.pdp_area_sq_cm,
            "scale_factor_mm_per_px": scan.scale_factor_mm_per_px,
            "barcode": scan.barcode,
            "is_calibrated": bool(scan.scale_factor_mm_per_px),
            "confidence": scan.extraction_confidence,
            "sha256_evidence_hash": scan.image_hash_sha256,
        },
        "violations": [
            {
                "rule_id": v.rule_id,
                "citation": v.citation,
                "severity": v.severity,
                "measured_value": v.measured_value,
                "required_value": v.required_value,
                "violation_text": v.violation_text,
            }
            for v in db_violations
        ],
    }

    json_str = json.dumps(report_dict, indent=2)
    return Response(
        content=json_str.encode("utf-8"),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=Notice_{scan_uuid}.json"},
    )


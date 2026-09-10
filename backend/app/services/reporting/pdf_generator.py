import os
import io
import hashlib
from datetime import datetime
from typing import Optional
from jinja2 import Environment, FileSystemLoader, select_autoescape
from app.schemas.report import LegalNoticeReport

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")

env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"])
)


def render_html_notice(report: LegalNoticeReport) -> str:
    template = env.get_template("legal_notice.html")

    violations_data = [
        {
            "rule_citation": v.citation,
            "severity": v.severity,
            "violation_details": f"{v.violation_text} (Measured: {v.measured_value}, Required: {v.required_value})"
        }
        for v in report.violations
    ]

    if isinstance(report.timestamp, datetime):
        date_str = report.timestamp.strftime("%Y-%m-%d")
        ts_str = report.timestamp.isoformat()
    elif isinstance(report.timestamp, str):
        date_str = report.timestamp[:10]
        ts_str = report.timestamp
    else:
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        ts_str = date_str

    decl = report.declarations

    if decl and decl.net_quantity_value is not None:
        net_qty_str = f"{decl.net_quantity_value} {decl.net_quantity_unit or ''}".strip()
    else:
        net_qty_str = "Not declared / Missing"

    if decl and decl.mrp is not None:
        mrp_str = f"Rs. {decl.mrp:.2f}" if isinstance(decl.mrp, (int, float)) else f"Rs. {decl.mrp}"
        if decl.is_mrp_inclusive_of_taxes:
            mrp_str += " (Incl. of all taxes)"
        else:
            mrp_str += " (Taxes not specified)"
    else:
        mrp_str = "Not declared / Missing"

    mfg_name = report.manufacturer or (decl.manufacturer_name if decl else "") or "Manufacturer / Packer / Importer"
    mfg_addr = (decl.manufacturer_address if decl and decl.manufacturer_address else "") or "Address not declared on packaging"

    measured_font_str = (
        f"{report.measured_font_height_mm:.2f} mm"
        if report.measured_font_height_mm is not None
        else "Uncalibrated (Standard EAN-13 barcode not detected)"
    )

    return template.render(
        notice_ref=report.notice_number,
        date=date_str,
        scan_uuid=report.scan_uuid or report.notice_number.replace("NOTICE-", "PRM-"),
        manufacturer_name=mfg_name,
        manufacturer_address=mfg_addr,
        commodity_name=report.product_name or (decl.generic_name if decl else "Packaged Commodity"),
        barcode=report.barcode,
        net_quantity=net_qty_str,
        mrp=mrp_str,
        measured_font_height=measured_font_str,
        violations=violations_data,
        sha256_hash=report.sha256_evidence_hash,
        engine_version="2.0.0",
        timestamp=ts_str,
        officer_name=f"Officer {report.inspecting_officer_badge}",
        officer_id=report.inspecting_officer_badge,
    )


def generate_pdf_report(report: LegalNoticeReport) -> bytes:
    """
    Synthesizes official court-admissible Notice of Non-Compliance.
    Renders with WeasyPrint if available; falls back to rendered HTML bytes.
    """
    html_content = render_html_notice(report)

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception:
        return html_content.encode("utf-8")

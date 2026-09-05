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

    return template.render(
        notice_ref=report.notice_number,
        date=date_str,
        scan_uuid=report.notice_number.replace("NOTICE-", "SCAN-"),
        manufacturer_name=report.manufacturer,
        manufacturer_address="Address as registered in inspection file",
        commodity_name=report.product_name,
        barcode=report.barcode,
        net_quantity="As recorded in scan declaration",
        mrp="As recorded in scan declaration",
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

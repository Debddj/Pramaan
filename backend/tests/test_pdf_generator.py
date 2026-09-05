import pytest
from app.schemas.report import LegalNoticeReport
from app.schemas.scan import LabelDeclaration, ViolationOut
from app.services.reporting.pdf_generator import generate_pdf_report, render_html_notice


def test_pdf_rendering_escapes_xss():
    report = LegalNoticeReport(
        notice_number="NOTICE-TEST-001",
        scan_uuid="SCAN-TEST-001",
        timestamp="2026-09-05T08:00:00",
        product_name="<script>alert('xss')</script> Cookies",
        manufacturer="Malicious Corp <img src=x onerror=alert(1)>",
        barcode="8901030000001",
        status="violation",
        violations=[
            ViolationOut(
                rule_id="LMPC-R6-1-A",
                citation="Rule 6(1)(a)",
                severity="critical",
                measured_value="None",
                required_value="Required",
                violation_text="<b>Missing Address</b>",
            )
        ],
        declarations=LabelDeclaration(),
        measured_font_height_mm=2.5,
        required_font_height_mm=4.0,
        pdp_area_sq_cm=150.0,
        sha256_evidence_hash="abcdef1234567890",
        inspecting_officer_badge="DL-LM-001",
    )

    html = render_html_notice(report)
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
    assert "<b>Missing Address</b>" not in html
    assert "&lt;b&gt;Missing Address&lt;/b&gt;" in html

    doc_bytes = generate_pdf_report(report)
    assert len(doc_bytes) > 0

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
    assert doc_bytes.startswith(b"%PDF-")


def test_pdf_rendering_contains_real_evidence_data():
    report = LegalNoticeReport(
        notice_number="NOTICE-TEST-002",
        scan_uuid="SCAN-REAL-999",
        timestamp="2026-09-05T08:00:00",
        product_name="Sunfeast Dark Fantasy",
        manufacturer="ITC Limited",
        barcode="8901725123456",
        status="violation",
        violations=[
            ViolationOut(
                rule_id="LMPC-R7-TABLE-1",
                citation="Rule 7(2), Table I",
                severity="critical",
                measured_value="1.85 mm",
                required_value="4.00 mm",
                violation_text="Measured numeral height 1.85mm is below statutory minimum 4.00mm",
            )
        ],
        declarations=LabelDeclaration(
            manufacturer_name="ITC Limited",
            manufacturer_address="Plot 42, Industrial Area, Haridwar, Uttarakhand",
            generic_name="Filled Biscuits",
            net_quantity_value=300.0,
            net_quantity_unit="g",
            mrp=90.0,
            is_mrp_inclusive_of_taxes=True,
        ),
        measured_font_height_mm=1.85,
        required_font_height_mm=4.0,
        pdp_area_sq_cm=160.0,
        sha256_evidence_hash="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        inspecting_officer_badge="IN-LMO-4821",
    )

    html = render_html_notice(report)
    # Ensure real evidence data is present
    assert "Plot 42, Industrial Area, Haridwar, Uttarakhand" in html
    assert "300.0 g" in html
    assert "Rs. 90.00 (Incl. of all taxes)" in html
    assert "1.85 mm" in html
    assert "SCAN-REAL-999" in html
    assert "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" in html

    # Ensure placeholder strings are completely absent
    assert "Address as registered in inspection file" not in html
    assert "As recorded in scan declaration" not in html

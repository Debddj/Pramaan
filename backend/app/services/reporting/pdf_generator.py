import hashlib
import html
import io
import logging
import os
from datetime import datetime, timezone
from typing import Any, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.schemas.report import LegalNoticeReport

logger = logging.getLogger(__name__)


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




def _render_reportlab_pdf(report: LegalNoticeReport) -> bytes:
    """
    Generates a valid binary PDF using ReportLab as a zero-external-dependency fallback.
    Safely escapes all strings against XML/HTML parser errors.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

    def _p(text: Any, style) -> Paragraph:
        val = "" if text is None else str(text)
        return Paragraph(html.escape(val), style)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        alignment=1,
        spaceAfter=4
    )
    sub_title_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=12
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=8,
        spaceAfter=4,
        fontName='Helvetica-Bold'
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1e293b')
    )
    bold_label = ParagraphStyle(
        'BoldLabel',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold'
    )

    elements = []

    # Header
    elements.append(Paragraph("GOVERNMENT OF INDIA", title_style))
    elements.append(Paragraph("DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION", ParagraphStyle('SubSub', parent=title_style, fontSize=11, leading=14)))
    elements.append(Paragraph("STATUTORY NOTICE OF NON-COMPLIANCE UNDER SECTION 36, LEGAL METROLOGY ACT, 2009", sub_title_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1e3a8a'), spaceBefore=2, spaceAfter=8))

    # Reference & Metadata Table
    ts = report.timestamp if isinstance(report.timestamp, str) else str(report.timestamp)
    meta_data = [
        [_p("Notice Ref:", bold_label), _p(report.notice_number or "N/A", body_style),
         _p("Date of Inspection:", bold_label), _p(ts[:10], body_style)],
        [_p("Scan UUID:", bold_label), _p(report.scan_uuid or "N/A", body_style),
         _p("Inspecting Officer:", bold_label), _p(f"Badge: {report.inspecting_officer_badge or 'N/A'}", body_style)],
        [_p("Target Manufacturer:", bold_label), _p(report.manufacturer or (report.declarations.manufacturer_name if report.declarations else "N/A"), body_style),
         _p("Commodity Name:", bold_label), _p(report.product_name or "Packaged Commodity", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[110, 160, 110, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 8))

    # Declarations Table
    elements.append(Paragraph("EVIDENCE & PACKAGE DECLARATIONS", section_style))
    decl = report.declarations
    net_qty = f"{decl.net_quantity_value} {decl.net_quantity_unit or ''}".strip() if decl and decl.net_quantity_value is not None else "Not declared"
    mrp_text = f"Rs. {decl.mrp:.2f}" if decl and decl.mrp is not None and isinstance(decl.mrp, (int, float)) else "Not declared"
    measured_h = f"{report.measured_font_height_mm:.2f} mm" if report.measured_font_height_mm is not None else "Not calibrated"
    decl_data = [
        [_p("Manufacturer Address:", bold_label), _p(decl.manufacturer_address if decl and decl.manufacturer_address else "Address not declared on packaging", body_style)],
        [_p("Declared Net Quantity:", bold_label), _p(net_qty, body_style)],
        [_p("Declared Retail Sale Price (MRP):", bold_label), _p(mrp_text, body_style)],
        [_p("Measured Numeral Height:", bold_label), _p(measured_h, body_style)],
        [_p("EAN-13 Barcode / Reference:", bold_label), _p(report.barcode or "N/A", body_style)],
    ]
    decl_table = Table(decl_data, colWidths=[180, 360])
    decl_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(decl_table)
    elements.append(Spacer(1, 8))

    # Violations Table
    elements.append(Paragraph("CODIFIED STATUTORY VIOLATIONS", section_style))
    viol_rows = [
        [_p("Rule Citation", bold_label), _p("Severity", bold_label), _p("Statutory Infraction Details", bold_label)]
    ]
    for v in report.violations:
        sev_color = colors.HexColor('#b91c1c') if v.severity.lower() == 'critical' else colors.HexColor('#d97706')
        viol_rows.append([
            _p(v.citation, body_style),
            _p(v.severity.upper(), ParagraphStyle('Sev', parent=body_style, textColor=sev_color)),
            _p(f"{v.violation_text} (Measured: {v.measured_value}, Required: {v.required_value})", body_style)
        ])
    if len(viol_rows) == 1:
        viol_rows.append([_p("None", body_style), _p("INFO", body_style), _p("No statutory violations identified.", body_style)])

    viol_table = Table(viol_rows, colWidths=[100, 70, 370])
    viol_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(viol_table)
    elements.append(Spacer(1, 8))

    # Evidence Hash & Officer Attestation
    elements.append(Paragraph("LEGAL INTEGRITY & CHAIN OF CUSTODY", section_style))
    safe_hash = html.escape(report.sha256_evidence_hash or 'N/A')
    hash_p = Paragraph(f"<b>Cryptographic SHA-256 Hash:</b> {safe_hash}<br/><b>Statutory Compliance Engine:</b> Pramaan v2.0.0 (Automated Metrology Certification)<br/><i>This report is generated pursuant to powers conferred under Section 15 of Legal Metrology Act, 2009.</i>", body_style)
    elements.append(hash_p)

    doc.build(elements)
    return buffer.getvalue()



def generate_pdf_report(report: LegalNoticeReport) -> bytes:
    """
    Synthesizes official court-admissible Notice of Non-Compliance.
    Renders with WeasyPrint if available; falls back to ReportLab native engine.
    Never returns raw HTML bytes with a .pdf extension.
    """
    try:
        from weasyprint import HTML
        html_content = render_html_notice(report)
        return HTML(string=html_content).write_pdf()
    except Exception as weasy_err:
        logger.warning(f"WeasyPrint unavailable or failed ({weasy_err}); falling back to native ReportLab engine.")

    try:
        return _render_reportlab_pdf(report)
    except Exception as rl_err:
        logger.error(f"ReportLab PDF generation also failed: {rl_err}")
        raise RuntimeError(f"PDF rendering failed across all engines: {rl_err}") from rl_err


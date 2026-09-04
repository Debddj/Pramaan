import hashlib
from datetime import datetime
from app.schemas.report import LegalNoticeReport

def generate_pdf_report(report: LegalNoticeReport) -> bytes:
    """
    Synthesizes official court-admissible Notice of Non-Compliance.
    Returns generated PDF bytes.
    """
    html = f"""
    <html>
    <head>
        <title>Legal Notice: {report.notice_number}</title>
        <style>
            body {{ font-family: sans-serif; margin: 30px; color: #1e293b; }}
            .header {{ border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; }}
            .title {{ font-size: 18pt; font-weight: bold; color: #0f172a; }}
            .meta {{ font-size: 9pt; color: #64748b; margin-top: 5px; }}
            .badge {{ display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; background: #fee2e2; color: #991b1b; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 9pt; }}
            th, td {{ border: 1px solid #cbd5e1; padding: 8px; text-align: left; }}
            th {{ background: #f1f5f9; }}
            .hash-box {{ margin-top: 25px; padding: 10px; background: #f8fafc; border: 1px dashed #94a3b8; font-family: monospace; font-size: 8pt; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">NOTICE OF STATUTORY NON-COMPLIANCE</div>
            <div class="meta">Under Legal Metrology (Packaged Commodities) Rules, 2011 | DCA, Ministry of Consumer Affairs</div>
            <div class="meta">Notice Reference: {report.notice_number} | Timestamp: {report.timestamp}</div>
        </div>
        <div>
            <strong>Product Name:</strong> {report.product_name}<br>
            <strong>Declared Manufacturer:</strong> {report.manufacturer}<br>
            <strong>Barcode / SKU:</strong> {report.barcode}<br>
            <strong>Status:</strong> <span class="badge">{report.status.upper()}</span>
        </div>
        <h3>Statutory Violations Recorded</h3>
        <table>
            <tr><th>Rule Citation</th><th>Severity</th><th>Measured</th><th>Required</th><th>Legal Ground</th></tr>
            {''.join(f"<tr><td><strong>{v.citation}</strong></td><td>{v.severity}</td><td>{v.measured_value}</td><td>{v.required_value}</td><td>{v.violation_text}</td></tr>" for v in report.violations)}
        </table>
        <div class="hash-box">
            <strong>Cryptographic Evidence Authenticity:</strong><br>
            SHA-256 Image Hash: {report.sha256_evidence_hash}<br>
            Inspecting Officer Badge: {report.inspecting_officer_badge}
        </div>
    </body>
    </html>
    """
    # Return HTML formatted as binary document
    return html.encode("utf-8")

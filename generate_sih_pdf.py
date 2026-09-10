"""
Pramaan - Smart India Hackathon 2026 Official Idea Submission PDF Generator
Generates Pramaan_SIH2026_Idea_Submission.pdf
Matches the exact 6-slide landscape layout required by the SIH 2026 portal.
"""

from reportlab.lib.pagesizes import landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_sih_pdf(output_path="Pramaan_SIH2026_Idea_Submission.pdf"):
    PAGE_WIDTH = 13.333 * inch
    PAGE_HEIGHT = 7.5 * inch

    c = canvas.Canvas(output_path, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))

    # Color definitions
    DARK_BLUE = colors.HexColor("#0F172A")
    NAVY_HEADER = colors.HexColor("#102A5E")
    GOLD_AMBER = colors.HexColor("#F59E0B")
    SLATE_TEXT = colors.HexColor("#334155")
    LIGHT_BG = colors.HexColor("#F8FAFC")
    BORDER_GREY = colors.HexColor("#CBD5E1")
    WHITE = colors.white
    SIH_CYAN = colors.HexColor("#0284C7")
    LIGHT_BLUE = colors.HexColor("#EFF6FF")
    EMERALD = colors.HexColor("#10B981")
    CRIMSON = colors.HexColor("#DC2626")

    styles = getSampleStyleSheet()

    # Custom typography styles
    style_body = ParagraphStyle(
        'SIH_Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=SLATE_TEXT
    )
    style_bullet_title = ParagraphStyle(
        'SIH_Bullet_Title',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=NAVY_HEADER
    )
    style_card_header = ParagraphStyle(
        'SIH_Card_Header',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=DARK_BLUE
    )

    def draw_slide_chrome(slide_title, slide_num):
        # Background
        c.setFillColor(LIGHT_BG)
        c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

        # Top-Left Team Badge (Oval)
        c.setFillColor(WHITE)
        c.setStrokeColor(DARK_BLUE)
        c.setLineWidth(1.5)
        badge_x = 0.5 * inch
        badge_y = 6.4 * inch
        badge_w = 1.6 * inch
        badge_h = 0.85 * inch
        c.roundRect(badge_x, badge_y, badge_w, badge_h, 15, fill=1, stroke=1)
        
        c.setFillColor(DARK_BLUE)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(badge_x + badge_w/2, badge_y + 0.48 * inch, "The Null")
        c.drawCentredString(badge_x + badge_w/2, badge_y + 0.28 * inch, "Pointers")

        # Center Title
        c.setFillColor(DARK_BLUE)
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(PAGE_WIDTH / 2, 6.6 * inch, slide_title)

        # Top-Right SIH Header
        c.setFillColor(NAVY_HEADER)
        c.setFont("Helvetica-Bold", 11)
        c.drawRightString(PAGE_WIDTH - 0.6 * inch, 6.9 * inch, "SMART INDIA")
        c.drawRightString(PAGE_WIDTH - 0.6 * inch, 6.7 * inch, "HACKATHON 2026")

        # Bottom Cyan Footer Bar
        c.setFillColor(SIH_CYAN)
        c.rect(0, 0, PAGE_WIDTH, 0.35 * inch, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 10)
        c.drawString(0.5 * inch, 0.12 * inch, "@SIH Idea submission- Template")
        c.drawRightString(PAGE_WIDTH - 0.5 * inch, 0.12 * inch, str(slide_num))

    # =========================================================================
    # SLIDE 1: TITLE PAGE
    # =========================================================================
    c.setFillColor(WHITE)
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    # Top Header
    c.setFillColor(NAVY_HEADER)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(PAGE_WIDTH / 2, 6.7 * inch, "SMART INDIA HACKATHON 2026")

    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(PAGE_WIDTH / 2, 6.15 * inch, "TITLE PAGE")

    # Left Metadata Box
    c.setFillColor(LIGHT_BG)
    c.setStrokeColor(BORDER_GREY)
    c.setLineWidth(1.5)
    c.roundRect(0.8 * inch, 1.0 * inch, 7.8 * inch, 4.8 * inch, 12, fill=1, stroke=1)

    # Meta items
    y = 5.2 * inch
    meta_lines = [
        ("Problem Statement ID –", "SIH26034"),
        ("Problem Statement Title –", "AI-Powered Automated Inspection & Enforcement System for\nLegal Metrology (Packaged Commodities) Rules"),
        ("Theme –", "Smart Automation / Regulatory Technology & Governance"),
        ("PS Category –", "Software"),
        ("Team ID –", "[Registered Portal Team ID]"),
        ("Team Name (Registered on portal) –", "The Null Pointers")
    ]

    for label, val in meta_lines:
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(DARK_BLUE)
        c.drawString(1.1 * inch, y, f"•  {label}")
        y -= 0.26 * inch

        c.setFont("Helvetica", 12)
        c.setFillColor(NAVY_HEADER if ("The Null" in val or "SIH26034" in val) else SLATE_TEXT)
        for subline in val.split("\n"):
            c.drawString(1.4 * inch, y, subline)
            y -= 0.24 * inch
        y -= 0.12 * inch

    # Right Showcase Card
    c.setFillColor(DARK_BLUE)
    c.roundRect(8.9 * inch, 1.0 * inch, 3.6 * inch, 4.8 * inch, 12, fill=1, stroke=0)

    c.setFillColor(GOLD_AMBER)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(10.7 * inch, 5.2 * inch, "PRAMAAN")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(10.7 * inch, 4.75 * inch, "(प्रमाण)")

    c.setFont("Helvetica-Oblique", 11)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawCentredString(10.7 * inch, 4.35 * inch, "National Legal Metrology Compliance &")
    c.drawCentredString(10.7 * inch, 4.15 * inch, "Regulatory Surveillance Operating System")

    c.setStrokeColor(GOLD_AMBER)
    c.setLineWidth(1)
    c.line(9.3 * inch, 3.9 * inch, 12.1 * inch, 3.9 * inch)

    pills = [
        "EAN-13 Optical Metrology (±0.1mm)",
        "Rule 7(2) & Rule 6 Deterministic Logic",
        "Section 65B Admissible PDF Notices",
        "Hardware Motion Guard (<0.18g)",
        "24/7 E-Commerce Surveillance"
    ]
    py = 3.5 * inch
    c.setFont("Helvetica", 10.5)
    c.setFillColor(WHITE)
    for p in pills:
        c.drawString(9.3 * inch, py, f"✔  {p}")
        py -= 0.35 * inch

    c.showPage()

    # =========================================================================
    # SLIDE 2: PROPOSED SOLUTION
    # =========================================================================
    draw_slide_chrome("PRAMAAN (प्रमाण)", 2)

    c.setFillColor(NAVY_HEADER)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(0.6 * inch, 5.85 * inch, "❖ Proposed Solution (Describe your Idea/Solution/Prototype)")

    col_w = 3.85 * inch
    col_h = 4.9 * inch
    c_y = 0.75 * inch

    # Card 1: Detailed Explanation
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(0.6 * inch, c_y, col_w, col_h, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(0.85 * inch, 5.3 * inch, "• Detailed Explanation")

    bullets_s2_c1 = [
        "<b>Unified Regulatory OS:</b> Automates end-to-end statutory enforcement of Legal Metrology (Packaged Commodities) Rules, 2011 across retail and e-commerce.",
        "<b>3-Tier Ecosystem:</b> Mobile Field Scanner (AR HUD), Web Enforcement Portal (Supervisory queue & notices), and Autonomous Market Surveillance Scraper.",
        "<b>Deterministic Logic:</b> Replaces contestable black-box AI with auditable, mathematical rules codification of statutory provisions.",
        "<b>Evidence-Grade Notice:</b> Automatically synthesizes Section 65B Indian Evidence Act compliant PDF notices with cryptographic SHA-256 hashes."
    ]
    by = 4.9 * inch
    for b in bullets_s2_c1:
        p = Paragraph(f"• {b}", style_body)
        w, h = p.wrap(col_w - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 0.85 * inch, by - h)
        by -= (h + 0.15 * inch)

    # Card 2: How it addresses the problem
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(4.75 * inch, c_y, col_w, col_h, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(5.0 * inch, 5.3 * inch, "• How It Addresses the Problem")

    bullets_s2_c2 = [
        "<b>Eliminates Physical Calipers:</b> Solves the slow, manual raid measurement bottleneck by measuring font heights to ±0.1mm in < 4 seconds.",
        "<b>Defeats Deceptive Packaging:</b> Checks pack weights against Second Schedule permissible sizes, catching subtle shrinkflation instantly.",
        "<b>Replaces Subjective Disputes:</b> Generates tamper-evident photographic bounding-box exhibits that withstand judicial scrutiny in consumer courts.",
        "<b>Monitors E-Commerce at Scale:</b> Autonomous scraper audits thousands of listings on Blinkit, Zepto, Amazon, and Flipkart 24/7.",
        "<b>Eliminates False Accusations:</b> Dual-tier confidence gate (<85%) diverts edge cases to human officer review."
    ]
    by = 4.9 * inch
    for b in bullets_s2_c2:
        p = Paragraph(f"• {b}", style_body)
        w, h = p.wrap(col_w - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 5.0 * inch, by - h)
        by -= (h + 0.14 * inch)

    # Card 3: Innovation & Uniqueness
    c.setFillColor(LIGHT_BLUE)
    c.setStrokeColor(colors.HexColor("#93C5FD"))
    c.roundRect(8.9 * inch, c_y, col_w, col_h, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(9.15 * inch, 5.3 * inch, "• Innovation and Uniqueness")

    bullets_s2_c3 = [
        "<b>Universal Optical Ruler:</b> World-first metrology utilizing standard GS1 EAN-13 barcodes (nominal 37.29mm) as physical calibration markers.",
        "<b>Hardware Motion Guard:</b> Integrates device accelerometer sensors (jitter < 0.18g) to mathematically block motion-blurred captures.",
        "<b>Human-in-the-Loop Triage:</b> Automated enforcement for high confidence (>85%); supervisory officer queue for complex edge cases.",
        "<b>True Offline Resilience:</b> Encrypted local SQLite queue enables complete field raid inspections in remote markets with zero cellular network."
    ]
    by = 4.9 * inch
    for b in bullets_s2_c3:
        p = Paragraph(f"• {b}", style_body)
        w, h = p.wrap(col_w - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 9.15 * inch, by - h)
        by -= (h + 0.16 * inch)

    c.showPage()

    # =========================================================================
    # SLIDE 3: TECHNICAL APPROACH
    # =========================================================================
    draw_slide_chrome("TECHNICAL APPROACH", 3)

    w3_left = 5.6 * inch
    w3_right = 6.5 * inch
    h3 = 5.2 * inch
    y3 = 0.75 * inch

    # Left: Technologies
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(0.6 * inch, y3, w3_left, h3, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(0.85 * inch, 5.65 * inch, "• Technologies to be Used")

    tech_bullets = [
        "<b>Mobile Scanner:</b> React Native (Expo 50), TypeScript, CameraX HUD, Accelerometer Sensor API, Encrypted SQLite Queue.",
        "<b>Web Enforcement Portal:</b> React 18, Vite, TailwindCSS, TypeScript, Lucide Icons, Axios Client (JWT Bearer auth).",
        "<b>Backend Gateway:</b> Python 3.11, FastAPI (ASGI async), Pydantic v2, SlowAPI rate-limiting, Structlog JSON logging.",
        "<b>Computer Vision:</b> OpenCV (Laplacian blur Var < 100, Specular Glare > 5%, WCAG Luminance Contrast Ratio > 3.0).",
        "<b>Optical Metrology:</b> PyZbar (EAN-13 37.29mm calibration standard, Scale factor S = 37.29 / W_px).",
        "<b>OCR & VLM Engine:</b> PaddleOCR Bilingual (English + Hindi) + Google Gemini 1.5/2.5 Flash VLM fallback + Regex Normalizer.",
        "<b>Database & Persistence:</b> PostgreSQL 16 (Scans & Audit logs), MinIO / S3 content-addressed storage.",
        "<b>Court Admissibility:</b> Jinja2 + WeasyPrint PDF/A with SHA-256 tamper-evident digital certificate chains."
    ]
    ty = 5.35 * inch
    for tb in tech_bullets:
        p = Paragraph(f"• {tb}", style_body)
        w, h = p.wrap(w3_left - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 0.85 * inch, ty - h)
        ty -= (h + 0.1 * inch)

    # Right: Methodology & Implementation Pipeline
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(6.5 * inch, y3, w3_right, h3, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(6.75 * inch, 5.65 * inch, "• Methodology & Implementation Pipeline")

    method_steps = [
        "<b>1. Ingestion:</b> Captures label via Mobile AR HUD, Bulk Web Upload, or E-Commerce Scraper; generates instant SHA-256 hash.",
        "<b>2. Preprocessing & Quality Check:</b> Evaluates blur and glare; PyZbar detects EAN-13 barcode to compute scale factor: S = 37.29mm / W_px. Measures numeral height: H_mm = H_px * S.",
        "<b>3. Bilingual Extraction:</b> PaddleOCR extracts structured text; Gemini VLM handles curved/degraded packaging; regex parses Net Qty, MRP, Mfg Date, Origin.",
        "<b>4. Rules Evaluation:</b> Codified engine verifies Rule 7(2) Table I (font height vs PDP), Rule 6 (mandatory declarations), and Second Schedule (standard sizes).",
        "<b>5. Confidence Triage:</b> Score >= 85% authorizes automatic violation notice; Score < 85% routes scan to Officer Review Queue for judicial safety.",
        "<b>6. Enforcement Notice PDF:</b> Renders Section 65B compliant legal notice with visual bounding boxes, officer badge, and immutable SHA-256 audit trail."
    ]
    my = 5.35 * inch
    for ms in method_steps:
        p = Paragraph(f"• {ms}", style_body)
        w, h = p.wrap(w3_right - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 6.75 * inch, my - h)
        my -= (h + 0.1 * inch)

    # Callout badge inside right card
    c.setFillColor(LIGHT_BLUE)
    c.setStrokeColor(EMERALD)
    c.roundRect(6.75 * inch, 0.9 * inch, w3_right - 0.5 * inch, 0.45 * inch, 4, fill=1, stroke=1)
    c.setFillColor(EMERALD)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(6.9 * inch, 1.18 * inch, "WORKING PROTOTYPE:")
    c.setFillColor(SLATE_TEXT)
    c.setFont("Helvetica", 9)
    c.drawString(8.65 * inch, 1.18 * inch, "Fully functional & cloud-deployed; 34/34 automated pytest tests passing; sub-4s latency.")

    c.showPage()

    # =========================================================================
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # =========================================================================
    draw_slide_chrome("FEASIBILITY AND VIABILITY", 4)

    w4 = 3.85 * inch
    h4 = 5.2 * inch
    y4 = 0.75 * inch

    # Box 1: Feasibility
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(0.6 * inch, y4, w4, h4, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(0.85 * inch, 5.65 * inch, "• Analysis of Feasibility")

    feas_points = [
        "<b>Zero Hardware Capex:</b> Runs on any standard Android/iOS smartphone already used by field inspectors; zero specialized calipers needed.",
        "<b>Economic Viability:</b> Built on 100% open-source software (Python, PostgreSQL, React). Cloud compute cost is < ₹0.20 per raid inspection.",
        "<b>Legal Admissibility:</b> Designed under Section 65B of Indian Evidence Act / BSA 2023 with cryptographic SHA-256 custody.",
        "<b>High Scalability:</b> Stateless FastAPI microservices horizontally scale across 28 states & 8 UTs on cloud container clusters.",
        "<b>Immediate Utility:</b> Direct operational utility for retail raids, border customs import checks, and e-commerce compliance."
    ]
    fy = 5.35 * inch
    for fp in feas_points:
        p = Paragraph(f"• {fp}", style_body)
        w, h = p.wrap(w4 - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 0.85 * inch, fy - h)
        fy -= (h + 0.15 * inch)

    # Box 2: Challenges & Risks
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(4.75 * inch, y4, w4, h4, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(5.0 * inch, 5.65 * inch, "• Potential Challenges & Risks")

    risk_points = [
        "<b>Cylindrical Packaging Curvature:</b> Bottles, cans, and deformable pouches cause perspective distortion of text and barcode widths.",
        "<b>Specular Glare & Reflections:</b> Shiny foil laminates in wholesale markets cause reflections that obscure numeral contours.",
        "<b>Rural Network Blackouts:</b> Field raids in basement godowns or rural mandis lack active 4G/5G cellular connectivity.",
        "<b>Adversarial Formatting:</b> Manufacturers deliberately using stylized typography, poor contrast, or buried declarations.",
        "<b>Judicial Scrutiny:</b> Consumer courts demanding absolute proof of measurement accuracy."
    ]
    ry = 5.35 * inch
    for rp in risk_points:
        p = Paragraph(f"• {rp}", style_body)
        w, h = p.wrap(w4 - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 5.0 * inch, ry - h)
        ry -= (h + 0.15 * inch)

    # Box 3: Mitigation Strategies
    c.setFillColor(LIGHT_BLUE)
    c.setStrokeColor(colors.HexColor("#93C5FD"))
    c.roundRect(8.9 * inch, y4, w4, h4, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(9.15 * inch, 5.65 * inch, "• Strategies for Overcoming")

    strat_points = [
        "<b>Cylindrical Unwrapping:</b> Perspective transformation and cylindrical surface unrolling algorithms normalize curved coordinates.",
        "<b>CLAHE & Glare Rejection:</b> OpenCV specular glare mask rejects highlights >5% and applies adaptive histogram equalization.",
        "<b>Encrypted Offline Queue:</b> Local SQLite/AsyncStorage caches scans offline and automatically syncs when network returns.",
        "<b>Dual OCR + VLM Pipeline:</b> PaddleOCR handles clean text; Gemini VLM acts as fallback for stylized, folded, or multilingual labels.",
        "<b>Human-in-the-Loop Triage:</b> Mandatory supervisory officer review for any scan with extraction confidence < 85%."
    ]
    sy = 5.35 * inch
    for sp in strat_points:
        p = Paragraph(f"• {sp}", style_body)
        w, h = p.wrap(w4 - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 9.15 * inch, sy - h)
        sy -= (h + 0.15 * inch)

    c.showPage()

    # =========================================================================
    # SLIDE 5: IMPACT AND BENEFITS
    # =========================================================================
    draw_slide_chrome("IMPACT AND BENEFITS", 5)

    w5 = 5.85 * inch
    h5 = 5.2 * inch
    y5 = 0.75 * inch

    # Left: Target Audience Impact
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(0.6 * inch, y5, w5, h5, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(0.85 * inch, 5.65 * inch, "• Potential Impact on Target Audience")

    audience_points = [
        "<b>Legal Metrology Field Inspectors:</b> Reduces physical inspection time from 15-20 minutes to under 4 seconds per commodity, multiplying daily raid throughput by 10x-15x.",
        "<b>Department of Consumer Affairs:</b> Provides centralized national surveillance dashboard across 28 states with real-time heatmaps of habitual non-compliant brands.",
        "<b>1.4 Billion Indian Consumers:</b> Protects citizens against deceptive undersizing ('shrinkflation'), missing manufacturer origins, expired batches, and hidden tax surcharges.",
        "<b>E-Commerce Marketplaces:</b> Enables autonomous regulatory pre-screening of 3rd-party sellers before product listings go live on consumer apps.",
        "<b>Compliant FMCG Manufacturers:</b> Fosters a fair and standardized compliance ecosystem free from arbitrary officer subjectivity and inspector bias."
    ]
    ay = 5.35 * inch
    for ap in audience_points:
        p = Paragraph(f"• {ap}", style_body)
        w, h = p.wrap(w5 - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 0.85 * inch, ay - h)
        ay -= (h + 0.18 * inch)

    # Right: Multi-Dimensional Benefits
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(6.85 * inch, y5, w5, h5, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(7.1 * inch, 5.65 * inch, "• Benefits of the Solution (Social, Economic, Environmental)")

    benefits_points = [
        "<b>❖ Economic Benefits:</b><br/>• <b>Revenue Recovery:</b> Recovers crores of rupees in compounding fees and penalties from chronic violators.<br/>• <b>Anti-Shrinkflation:</b> Prevents deceptive 10-15% net quantity reductions by enforcing Second Schedule sizes.",
        "<b>❖ Social & Public Health Benefits:</b><br/>• <b>Consumer Safety:</b> Guarantees mandatory legibility of expiry dates, allergen warnings, and consumer care on baby foods and pharmaceuticals.<br/>• <b>Swift Justice:</b> Court-admissible notices resolve consumer court proceedings in days rather than years.",
        "<b>❖ Environmental & Governance Benefits:</b><br/>• <b>100% Paperless Raids:</b> Eliminates manual paper case diaries and carbon-copy seizure memos with encrypted digital records.<br/>• <b>Corruption-Proof:</b> Immutable cryptographic audit trails prevent record tampering or unauthorized suppression."
    ]
    by = 5.35 * inch
    for bp in benefits_points:
        p = Paragraph(bp, style_body)
        w, h = p.wrap(w5 - 0.5 * inch, 1.5 * inch)
        p.drawOn(c, 7.1 * inch, by - h)
        by -= (h + 0.2 * inch)

    c.showPage()

    # =========================================================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # =========================================================================
    draw_slide_chrome("RESEARCH AND REFERENCES", 6)

    w6 = 5.85 * inch
    h6 = 5.2 * inch
    y6 = 0.75 * inch

    # Left: Statutory References
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(0.6 * inch, y6, w6, h6, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(0.85 * inch, 5.65 * inch, "• Statutory & Legal References")

    legal_refs = [
        "<b>1. Legal Metrology Act, 2009 (Act No. 1 of 2010):</b> Ministry of Consumer Affairs, Food & Public Distribution, Government of India. Mandates standard weights, measures, and retail declarations.",
        "<b>2. Legal Metrology (Packaged Commodities) Rules, 2011 (amended up to 2022):</b> Specific codification of Rule 6 (Mandatory Declarations), Rule 7(2) Table I & II (Numeral Heights), Rule 26 (Small Package Exemptions).",
        "<b>3. Second Schedule of LMPC Rules, 2011:</b> Permissible standardized packaging quantities for foodstuff, personal care, and lubricants.",
        "<b>4. Section 65B of Indian Evidence Act, 1872 / Bharatiya Sakshya Adhiniyam, 2023:</b> Special provisions regarding admissibility of electronic records, SHA-256 digital hashes, and officer certification.",
        "<b>5. Consumer Protection (E-Commerce) Rules, 2020:</b> Mandatory display of country of origin, MRP, and net quantity on e-commerce platforms."
    ]
    ly = 5.35 * inch
    for lr in legal_refs:
        p = Paragraph(f"• {lr}", style_body)
        w, h = p.wrap(w6 - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 0.85 * inch, ly - h)
        ly -= (h + 0.16 * inch)

    # Right: Technical Standards & Live Code Links
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER_GREY)
    c.roundRect(6.85 * inch, y6, w6, h6, 8, fill=1, stroke=1)
    c.setFillColor(DARK_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(7.1 * inch, 5.65 * inch, "• Technical Standards & Project Links")

    tech_refs = [
        "<b>1. GS1 General Specifications (Release 23.0):</b> Section 5.2.1: EAN-13 Barcode Symbol Specifications. Establishes the universal nominal barcode width (W = 37.29 mm) for physical scale calibration.",
        "<b>2. ISO/IEC 15420:2009 Standard:</b> Information technology — Automatic identification and data capture techniques — EAN/UPC bar code symbology specification.",
        "<b>3. Du, Y., et al. (2020) 'PP-OCR: A Practical Ultra Lightweight OCR System':</b> arXiv:2009.09941. Bilingual text detection and recognition methodology.",
        "<b>4. W3C WCAG 2.1 Contrast Guidelines:</b> Relative luminance contrast ratio standard (3:1 minimum compliance threshold for package legibility).",
        "<b>5. Live Working Codebase & Deployment:</b><br/>• GitHub Repository: <u>https://github.com/Debddj/Pramaan</u><br/>• Includes tested FastAPI backend, React Native mobile app, web dashboard, 34 automated unit tests, and 1-click cloud deployment specs."
    ]
    ry = 5.35 * inch
    for tr in tech_refs:
        p = Paragraph(f"• {tr}", style_body)
        w, h = p.wrap(w6 - 0.5 * inch, 1.2 * inch)
        p.drawOn(c, 7.1 * inch, ry - h)
        ry -= (h + 0.16 * inch)

    c.showPage()
    c.save()
    print(f"[SUCCESS] Saved Submission PDF to: {output_path}")

if __name__ == "__main__":
    create_sih_pdf()

"""
Pramaan - Smart India Hackathon 2026 Official Idea Submission PPT & PDF Generator
Generates:
1. Pramaan_SIH2026_Idea_Submission.pptx (Editable PowerPoint matching official 6-slide template)
2. Pramaan_SIH2026_Idea_Submission.pdf (Official submission-ready PDF for portal upload)
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_sih_pptx(output_path="Pramaan_SIH2026_Idea_Submission.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6] # Blank slide

    # Color Palette
    DARK_BLUE = RGBColor(15, 23, 42)      # #0F172A
    NAVY_HEADER = RGBColor(16, 42, 94)    # Official SIH Blue
    GOLD_AMBER = RGBColor(245, 158, 11)   # #F59E0B
    SLATE_TEXT = RGBColor(51, 65, 85)     # #334155
    WHITE = RGBColor(255, 255, 255)
    BORDER_GREY = RGBColor(203, 213, 225) # #CBD5E1
    LIGHT_BG = RGBColor(248, 250, 252)    # #F8FAFC
    CARD_BG = RGBColor(255, 255, 255)
    EMERALD = RGBColor(16, 185, 129)
    CRIMSON = RGBColor(220, 38, 38)
    LIGHT_BLUE = RGBColor(239, 246, 255)

    def add_header_and_badge(slide, title_text, slide_num):
        # Background color
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = LIGHT_BG
        bg.line.fill.background()

        # Top-Left Team Badge Oval (as in SIH template)
        badge = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.4), Inches(0.3), Inches(1.5), Inches(0.95))
        badge.fill.solid()
        badge.fill.fore_color.rgb = WHITE
        badge.line.color.rgb = DARK_BLUE
        badge.line.width = Pt(1.5)
        tf_b = badge.text_frame
        tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_b1 = tf_b.paragraphs[0]
        p_b1.text = "The Null"
        p_b1.font.bold = True
        p_b1.font.size = Pt(11)
        p_b1.font.color.rgb = DARK_BLUE
        p_b1.alignment = PP_ALIGN.CENTER
        p_b2 = tf_b.add_paragraph()
        p_b2.text = "Pointers"
        p_b2.font.bold = True
        p_b2.font.size = Pt(11)
        p_b2.font.color.rgb = DARK_BLUE
        p_b2.alignment = PP_ALIGN.CENTER

        # Center Slide Title
        title_box = slide.shapes.add_textbox(Inches(2.2), Inches(0.35), Inches(8.8), Inches(0.85))
        tf_t = title_box.text_frame
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.bold = True
        p_t.font.size = Pt(26)
        p_t.font.color.rgb = DARK_BLUE
        p_t.alignment = PP_ALIGN.CENTER

        # Top-Right SIH 2026 Logo placeholder text
        sih_box = slide.shapes.add_textbox(Inches(11.0), Inches(0.25), Inches(2.0), Inches(0.9))
        tf_s = sih_box.text_frame
        p_s1 = tf_s.paragraphs[0]
        p_s1.text = "SMART INDIA"
        p_s1.font.bold = True
        p_s1.font.size = Pt(12)
        p_s1.font.color.rgb = NAVY_HEADER
        p_s1.alignment = PP_ALIGN.RIGHT
        p_s2 = tf_s.add_paragraph()
        p_s2.text = "HACKATHON 2026"
        p_s2.font.bold = True
        p_s2.font.size = Pt(12)
        p_s2.font.color.rgb = NAVY_HEADER
        p_s2.alignment = PP_ALIGN.RIGHT

        # Bottom SIH Footer Bar
        footer = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.15), Inches(13.333), Inches(0.35))
        footer.fill.solid()
        footer.fill.fore_color.rgb = RGBColor(2, 132, 199) # SIH cyan-blue
        footer.line.fill.background()
        tf_f = footer.text_frame
        tf_f.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_f = tf_f.paragraphs[0]
        p_f.text = f"@SIH Idea submission- Template                                                                                                                                                 {slide_num}"
        p_f.font.size = Pt(10)
        p_f.font.color.rgb = WHITE

    # =========================================================================
    # SLIDE 1: TITLE PAGE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_slide_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = WHITE
    bg1.line.fill.background()

    # Top Header
    top_bar = slide1.shapes.add_textbox(Inches(1.5), Inches(0.4), Inches(10.3), Inches(0.8))
    tf_top = top_bar.text_frame
    p_top = tf_top.paragraphs[0]
    p_top.text = "SMART INDIA HACKATHON 2026"
    p_top.font.bold = True
    p_top.font.size = Pt(32)
    p_top.font.color.rgb = NAVY_HEADER
    p_top.alignment = PP_ALIGN.CENTER

    sub_bar = slide1.shapes.add_textbox(Inches(1.5), Inches(1.2), Inches(10.3), Inches(0.6))
    tf_sub = sub_bar.text_frame
    p_sub = tf_sub.paragraphs[0]
    p_sub.text = "TITLE PAGE"
    p_sub.font.bold = True
    p_sub.font.size = Pt(24)
    p_sub.font.color.rgb = DARK_BLUE
    p_sub.alignment = PP_ALIGN.CENTER

    # Left Metadata Box (Clean Card)
    meta_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(8.0), Inches(4.8))
    meta_card.fill.solid()
    meta_card.fill.fore_color.rgb = LIGHT_BG
    meta_card.line.color.rgb = BORDER_GREY
    meta_card.line.width = Pt(1.5)

    tf_meta = meta_card.text_frame
    tf_meta.margin_left = Inches(0.4)
    tf_meta.margin_top = Inches(0.3)
    tf_meta.margin_right = Inches(0.3)

    items = [
        ("• Problem Statement ID – ", "SIH26034"),
        ("• Problem Statement Title – ", "AI-Powered Automated Inspection & Enforcement System for Legal Metrology (Packaged Commodities) Rules"),
        ("• Theme – ", "Smart Automation / Regulatory Technology & Governance"),
        ("• PS Category – ", "Software"),
        ("• Team ID – ", "[Registered Portal Team ID]"),
        ("• Team Name (Registered on portal) – ", "The Null Pointers")
    ]

    for i, (label, val) in enumerate(items):
        p = tf_meta.paragraphs[0] if i == 0 else tf_meta.add_paragraph()
        p.space_after = Pt(12)
        run1 = p.add_run()
        run1.text = label
        run1.font.bold = True
        run1.font.size = Pt(15)
        run1.font.color.rgb = DARK_BLUE

        run2 = p.add_run()
        run2.text = val
        run2.font.bold = (i == 0 or i == 5)
        run2.font.size = Pt(14)
        run2.font.color.rgb = NAVY_HEADER if (i == 0 or i == 5) else SLATE_TEXT

    # Right Showcase Graphic / Branding Box
    brand_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.1), Inches(2.0), Inches(3.5), Inches(4.8))
    brand_card.fill.solid()
    brand_card.fill.fore_color.rgb = DARK_BLUE
    brand_card.line.fill.background()

    tf_brand = brand_card.text_frame
    tf_brand.margin_left = Inches(0.25)
    tf_brand.margin_right = Inches(0.25)
    tf_brand.margin_top = Inches(0.5)

    pb1 = tf_brand.paragraphs[0]
    pb1.text = "PRAMAAN"
    pb1.font.bold = True
    pb1.font.size = Pt(28)
    pb1.font.color.rgb = GOLD_AMBER
    pb1.alignment = PP_ALIGN.CENTER

    pb2 = tf_brand.add_paragraph()
    pb2.text = "(प्रमाण)"
    pb2.font.bold = True
    pb2.font.size = Pt(20)
    pb2.font.color.rgb = WHITE
    pb2.alignment = PP_ALIGN.CENTER
    pb2.space_after = Pt(16)

    pb3 = tf_brand.add_paragraph()
    pb3.text = "National Legal Metrology Compliance & Regulatory Surveillance Operating System"
    pb3.font.size = Pt(12)
    pb3.font.color.rgb = RGBColor(226, 232, 240)
    pb3.alignment = PP_ALIGN.CENTER
    pb3.space_after = Pt(16)

    features = [
        "✔ EAN-13 Optical Metrology (±0.1mm)",
        "✔ Rule 7(2) & Rule 6 Codified Rules",
        "✔ Section 65B Admissible PDF Notices",
        "✔ 24/7 E-Commerce Surveillance",
        "✔ Accelerometer Jitter Guard (<0.18g)"
    ]
    for feat in features:
        pf = tf_brand.add_paragraph()
        pf.text = feat
        pf.font.size = Pt(11)
        pf.font.color.rgb = WHITE
        pf.space_after = Pt(6)

    # =========================================================================
    # SLIDE 2: PROPOSED SOLUTION
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_slide_layout)
    add_header_and_badge(slide2, "PRAMAAN (प्रमाण)", 2)

    # Subtitle Header: Proposed Solution
    sub_title = slide2.shapes.add_textbox(Inches(0.6), Inches(1.3), Inches(12.1), Inches(0.5))
    tf_s2 = sub_title.text_frame
    ps2 = tf_s2.paragraphs[0]
    ps2.text = "❖ Proposed Solution (Describe your Idea/Solution/Prototype)"
    ps2.font.bold = True
    ps2.font.size = Pt(18)
    ps2.font.color.rgb = NAVY_HEADER

    # 3 Columns Cards corresponding to the 3 mandatory pointers
    col_width = Inches(3.8)
    gap = Inches(0.3)
    start_x = Inches(0.6)
    card_y = Inches(1.85)
    card_h = Inches(5.0)

    # Col 1: Detailed explanation
    c1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x, card_y, col_width, card_h)
    c1.fill.solid()
    c1.fill.fore_color.rgb = WHITE
    c1.line.color.rgb = BORDER_GREY
    c1.line.width = Pt(1.5)
    tf_c1 = c1.text_frame
    tf_c1.margin_left = tf_c1.margin_right = tf_c1.margin_top = Inches(0.25)
    
    p1 = tf_c1.paragraphs[0]
    p1.text = "• Detailed Explanation"
    p1.font.bold = True
    p1.font.size = Pt(14)
    p1.font.color.rgb = DARK_BLUE
    p1.space_after = Pt(8)

    c1_bullets = [
        ("Unified Regulatory OS: ", "Automates end-to-end enforcement of Legal Metrology (Packaged Commodities) Rules, 2011 across physical retail and e-commerce."),
        ("3-Tier Architecture: ", "Mobile Field Scanner (CameraX HUD), Web Adjudication Portal (FastAPI + React), and Autonomous Market Crawler."),
        ("Deterministic Enforcement: ", "Translates legal statutes into verifiable, mathematical logic rules — eliminating opaque black-box AI errors."),
        ("Evidence-Grade Outputs: ", "Instantly synthesizes Section 65B Indian Evidence Act compliant PDF notices with cryptographic SHA-256 hashes.")
    ]
    for title, desc in c1_bullets:
        pb = tf_c1.add_paragraph()
        pb.space_after = Pt(6)
        r1 = pb.add_run()
        r1.text = title
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = NAVY_HEADER
        r2 = pb.add_run()
        r2.text = desc
        r2.font.size = Pt(10)
        r2.font.color.rgb = SLATE_TEXT

    # Col 2: How it addresses the problem
    c2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x + col_width + gap, card_y, col_width, card_h)
    c2.fill.solid()
    c2.fill.fore_color.rgb = WHITE
    c2.line.color.rgb = BORDER_GREY
    c2.line.width = Pt(1.5)
    tf_c2 = c2.text_frame
    tf_c2.margin_left = tf_c2.margin_right = tf_c2.margin_top = Inches(0.25)

    p2 = tf_c2.paragraphs[0]
    p2.text = "• How It Addresses the Problem"
    p2.font.bold = True
    p2.font.size = Pt(14)
    p2.font.color.rgb = DARK_BLUE
    p2.space_after = Pt(8)

    c2_bullets = [
        ("Eliminates Manual Calipers: ", "Field inspectors struggle with physical rulers; Pramaan measures font heights down to ±0.1mm in < 4 seconds."),
        ("Solves Subjective Raids: ", "Replaces inspector dispute with court-admissible bounding-box image exhibits and citation logs."),
        ("Tackles Deceptive Packaging: ", "Automatically detects non-standard sizes under Second Schedule (anti-shrinkflation enforcement)."),
        ("Overcomes E-Commerce Scale: ", "Manual review cannot monitor millions of listings; our crawler scans 10,000+ online listings daily 24/7."),
        ("Zero False Accusations: ", "Triage gate redirects scans with <85% confidence to human review queue.")
    ]
    for title, desc in c2_bullets:
        pb = tf_c2.add_paragraph()
        pb.space_after = Pt(6)
        r1 = pb.add_run()
        r1.text = title
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = NAVY_HEADER
        r2 = pb.add_run()
        r2.text = desc
        r2.font.size = Pt(10)
        r2.font.color.rgb = SLATE_TEXT

    # Col 3: Innovation and uniqueness
    c3 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x + (col_width + gap)*2, card_y, col_width, card_h)
    c3.fill.solid()
    c3.fill.fore_color.rgb = LIGHT_BLUE
    c3.line.color.rgb = RGBColor(147, 197, 253)
    c3.line.width = Pt(1.5)
    tf_c3 = c3.text_frame
    tf_c3.margin_left = tf_c3.margin_right = tf_c3.margin_top = Inches(0.25)

    p3 = tf_c3.paragraphs[0]
    p3.text = "• Innovation & Uniqueness"
    p3.font.bold = True
    p3.font.size = Pt(14)
    p3.font.color.rgb = DARK_BLUE
    p3.space_after = Pt(8)

    c3_bullets = [
        ("Universal Optical Ruler: ", "World-first metrology utilizing standard GS1 EAN-13 barcodes (nominal 37.29mm) as physical calibration markers."),
        ("Hardware Accelerometer Guard: ", "Integrates device motion sensors (jitter < 0.18g) to mathematically prevent motion-blurred captures."),
        ("Dual-Tier Confidence Gate: ", "Automated legal notice generation for high confidence (>85%); human-in-the-loop review queue for edge cases."),
        ("True Offline Resilience: ", "Encrypted local SQLite queue enables complete field raid functionality in rural/basement markets with no signal.")
    ]
    for title, desc in c3_bullets:
        pb = tf_c3.add_paragraph()
        pb.space_after = Pt(6)
        r1 = pb.add_run()
        r1.text = title
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = DARK_BLUE
        r2 = pb.add_run()
        r2.text = desc
        r2.font.size = Pt(10)
        r2.font.color.rgb = SLATE_TEXT

    # =========================================================================
    # SLIDE 3: TECHNICAL APPROACH
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_slide_layout)
    add_header_and_badge(slide3, "TECHNICAL APPROACH", 3)

    # 2 Big Cards: Left = Tech Stack Grid, Right = Methodology Pipeline
    w_left = Inches(5.2)
    w_right = Inches(6.6)
    c_y = Inches(1.4)
    c_h = Inches(5.5)

    # Left: Technologies to be used
    left_card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), c_y, w_left, c_h)
    left_card.fill.solid()
    left_card.fill.fore_color.rgb = WHITE
    left_card.line.color.rgb = BORDER_GREY
    left_card.line.width = Pt(1.5)
    tf_l = left_card.text_frame
    tf_l.margin_left = tf_l.margin_right = tf_l.margin_top = Inches(0.25)

    pl_t = tf_l.paragraphs[0]
    pl_t.text = "• Technologies to be Used"
    pl_t.font.bold = True
    pl_t.font.size = Pt(14)
    pl_t.font.color.rgb = DARK_BLUE
    pl_t.space_after = Pt(8)

    tech_stack = [
        ("Mobile Client", "React Native (Expo 50), TypeScript, CameraX HUD, Accelerometer Sensor API, Offline SQLite Queue"),
        ("Web Portal", "React 18, Vite, TailwindCSS, TypeScript, Lucide Icons, Axios Client (JWT bearer auth)"),
        ("Backend Gateway", "Python 3.11, FastAPI (ASGI async), Pydantic v2, SlowAPI rate-limiting, Structlog JSON logging"),
        ("Computer Vision", "OpenCV (Laplacian blur Var < 100, glare mask > 5%, WCAG luminance contrast ratio > 3.0)"),
        ("Optical Metrology", "PyZbar (EAN-13 37.29mm optical calibration, sub-pixel scale factor S = 37.29 / W_px)"),
        ("OCR & VLM Engine", "PaddleOCR Bilingual (English + Hindi) + Google Gemini 1.5/2.5 Flash VLM fallback + Regex Entity Extractor"),
        ("Database & Storage", "PostgreSQL 16 (relational scans & audit logs), MinIO / S3 content-addressed object store"),
        ("Notice Generation", "Jinja2 template engine + WeasyPrint PDF/A with SHA-256 tamper-evident digital hashes")
    ]
    for layer, tools in tech_stack:
        p = tf_l.add_paragraph()
        p.space_after = Pt(4)
        r1 = p.add_run()
        r1.text = f"{layer}: "
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = NAVY_HEADER
        r2 = p.add_run()
        r2.text = tools
        r2.font.size = Pt(9)
        r2.font.color.rgb = SLATE_TEXT

    # Right: Methodology & Process
    right_card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.1), c_y, w_right, c_h)
    right_card.fill.solid()
    right_card.fill.fore_color.rgb = WHITE
    right_card.line.color.rgb = BORDER_GREY
    right_card.line.width = Pt(1.5)
    tf_r = right_card.text_frame
    tf_r.margin_left = tf_r.margin_right = tf_r.margin_top = Inches(0.25)

    pr_t = tf_r.paragraphs[0]
    pr_t.text = "• Methodology & Implementation Pipeline"
    pr_t.font.bold = True
    pr_t.font.size = Pt(14)
    pr_t.font.color.rgb = DARK_BLUE
    pr_t.space_after = Pt(8)

    steps = [
        ("Step 1: Multi-Source Ingestion", "Captures package imagery via Mobile AR HUD, Web Bulk Upload, or E-Commerce Scraper. Computes immediate SHA-256 image fingerprint."),
        ("Step 2: Optical Metrology & Quality Check", "Evaluates blur/glare; PyZbar locates EAN-13 barcode. Calculates scale factor: S = 37.29mm / W_px. Measures numeral height: H_mm = H_px * S."),
        ("Step 3: Hybrid Extraction & Normalization", "PaddleOCR extracts bilingual text; Gemini VLM handles degraded/curved packaging. Regex parses Net Qty, MRP, Mfg Date, Consumer Care."),
        ("Step 4: Statutory Rules Codification", "Evaluates Rule 7(2) Table I (font height vs PDP area), Rule 6 (mandatory declarations), and Second Schedule (standard pack sizes)."),
        ("Step 5: Confidence Gate & Human Triage", "Score >= 85% triggers automated statutory determination; Score < 85% routes scan to Officer Review Queue for judicial safety."),
        ("Step 6: Admissible Legal PDF Generation", "Renders Form I Notice of Non-Compliance bearing officer badge, timestamp, bounding-box exhibits, and SHA-256 evidence chain.")
    ]
    for step_title, step_desc in steps:
        p = tf_r.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = f"{step_title}: "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = DARK_BLUE
        r2 = p.add_run()
        r2.text = step_desc
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = SLATE_TEXT

    # Prototype Status Callout inside right card
    proto_box = tf_r.add_paragraph()
    proto_box.space_before = Pt(6)
    rp1 = proto_box.add_run()
    rp1.text = "PROTOTYPE STATUS: "
    rp1.font.bold = True
    rp1.font.size = Pt(10)
    rp1.font.color.rgb = EMERALD
    rp2 = proto_box.add_run()
    rp2.text = "Fully functional & cloud-deployed; 34/34 automated pytest tests passing; sub-4s latency verified."
    rp2.font.size = Pt(9.5)
    rp2.font.color.rgb = SLATE_TEXT

    # =========================================================================
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_slide_layout)
    add_header_and_badge(slide4, "FEASIBILITY AND VIABILITY", 4)

    card_w4 = Inches(3.8)
    gap4 = Inches(0.3)
    start_x4 = Inches(0.6)
    card_y4 = Inches(1.4)
    card_h4 = Inches(5.5)

    # Box 1: Feasibility Analysis
    fb1 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x4, card_y4, card_w4, card_h4)
    fb1.fill.solid()
    fb1.fill.fore_color.rgb = WHITE
    fb1.line.color.rgb = BORDER_GREY
    fb1.line.width = Pt(1.5)
    tf_fb1 = fb1.text_frame
    tf_fb1.margin_left = tf_fb1.margin_right = tf_fb1.margin_top = Inches(0.25)

    pf1 = tf_fb1.paragraphs[0]
    pf1.text = "• Analysis of Feasibility"
    pf1.font.bold = True
    pf1.font.size = Pt(14)
    pf1.font.color.rgb = DARK_BLUE
    pf1.space_after = Pt(8)

    feas_points = [
        ("Zero Hardware Capex: ", "Runs on any existing Android/iOS smartphone owned by state inspectors; eliminates costly specialized optical calipers."),
        ("Economic Viability: ", "Built on 100% open-source foundation (Python, PostgreSQL, React). Cloud compute cost is < ₹0.20 per raid inspection."),
        ("Legal Feasibility: ", "Engineered under Section 65B of Indian Evidence Act / Bharatiya Sakshya Adhiniyam, 2023 with cryptographic SHA-256 custody."),
        ("Operational Scalability: ", "Stateless FastAPI microservices horizontally scale across 28 states & 8 UTs on cloud container clusters."),
        ("Immediate Department Utility: ", "Direct drop-in utility for retail raids, customs import clearances, and e-commerce compliance cells.")
    ]
    for t, d in feas_points:
        p = tf_fb1.add_paragraph()
        p.space_after = Pt(6)
        r1 = p.add_run()
        r1.text = t
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = NAVY_HEADER
        r2 = p.add_run()
        r2.text = d
        r2.font.size = Pt(10)
        r2.font.color.rgb = SLATE_TEXT

    # Box 2: Challenges and Risks
    fb2 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x4 + card_w4 + gap4, card_y4, card_w4, card_h4)
    fb2.fill.solid()
    fb2.fill.fore_color.rgb = WHITE
    fb2.line.color.rgb = BORDER_GREY
    fb2.line.width = Pt(1.5)
    tf_fb2 = fb2.text_frame
    tf_fb2.margin_left = tf_fb2.margin_right = tf_fb2.margin_top = Inches(0.25)

    pf2 = tf_fb2.paragraphs[0]
    pf2.text = "• Potential Challenges & Risks"
    pf2.font.bold = True
    pf2.font.size = Pt(14)
    pf2.font.color.rgb = DARK_BLUE
    pf2.space_after = Pt(8)

    risk_points = [
        ("Cylindrical Packaging Curvature: ", "Bottles, cans, and deformable pouches cause perspective distortion of text and barcode widths."),
        ("Reflective Metallic Glare: ", "Shiny foil laminates in wholesale markets cause specular reflections that obscure numerals."),
        ("Network Blackouts: ", "Field inspections in basement godowns or rural mandis lack active 4G/5G mobile data connectivity."),
        ("Adversarial Formatting: ", "Manufacturers deliberately using stylized scripts, poor background contrast, or hidden declarations."),
        ("Judicial Scrutiny: ", "Consumer courts demanding unassailable proof of measurement precision.")
    ]
    for t, d in risk_points:
        p = tf_fb2.add_paragraph()
        p.space_after = Pt(6)
        r1 = p.add_run()
        r1.text = t
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = CRIMSON
        r2 = p.add_run()
        r2.text = d
        r2.font.size = Pt(10)
        r2.font.color.rgb = SLATE_TEXT

    # Box 3: Mitigation Strategies
    fb3 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x4 + (card_w4 + gap4)*2, card_y4, card_w4, card_h4)
    fb3.fill.solid()
    fb3.fill.fore_color.rgb = LIGHT_BLUE
    fb3.line.color.rgb = RGBColor(147, 197, 253)
    fb3.line.width = Pt(1.5)
    tf_fb3 = fb3.text_frame
    tf_fb3.margin_left = tf_fb3.margin_right = tf_fb3.margin_top = Inches(0.25)

    pf3 = tf_fb3.paragraphs[0]
    pf3.text = "• Strategies for Overcoming"
    pf3.font.bold = True
    pf3.font.size = Pt(14)
    pf3.font.color.rgb = DARK_BLUE
    pf3.space_after = Pt(8)

    strat_points = [
        ("Cylindrical Unwrapping: ", "Perspective transformation and cylindrical surface unrolling algorithms normalize curved coordinates."),
        ("CLAHE & Glare Rejection: ", "OpenCV specular glare mask rejects highlights >5% and applies adaptive histogram equalization."),
        ("Encrypted Offline Queue: ", "Local SQLite/AsyncStorage caches scans offline and automatically syncs when network returns."),
        ("Dual OCR + VLM Pipeline: ", "PaddleOCR handles structured text; Gemini VLM acts as fallback for stylized, folded, or multilingual labels."),
        ("Human-in-the-Loop Triage: ", "Mandatory supervisory officer adjudication for any scan with extraction confidence < 85%.")
    ]
    for t, d in strat_points:
        p = tf_fb3.add_paragraph()
        p.space_after = Pt(6)
        r1 = p.add_run()
        r1.text = t
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = EMERALD
        r2 = p.add_run()
        r2.text = d
        r2.font.size = Pt(10)
        r2.font.color.rgb = SLATE_TEXT

    # =========================================================================
    # SLIDE 5: IMPACT AND BENEFITS
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_slide_layout)
    add_header_and_badge(slide5, "IMPACT AND BENEFITS", 5)

    w5 = Inches(5.8)
    gap5 = Inches(0.5)
    h5 = Inches(5.5)
    y5 = Inches(1.4)

    # Left: Potential impact on target audience
    ib_left = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), y5, w5, h5)
    ib_left.fill.solid()
    ib_left.fill.fore_color.rgb = WHITE
    ib_left.line.color.rgb = BORDER_GREY
    ib_left.line.width = Pt(1.5)
    tf_ib1 = ib_left.text_frame
    tf_ib1.margin_left = tf_ib1.margin_right = tf_ib1.margin_top = Inches(0.3)

    pib1 = tf_ib1.paragraphs[0]
    pib1.text = "• Potential Impact on Target Audience"
    pib1.font.bold = True
    pib1.font.size = Pt(14)
    pib1.font.color.rgb = DARK_BLUE
    pib1.space_after = Pt(10)

    audience_impact = [
        ("Legal Metrology Field Inspectors: ", "Reduces field inspection time from 15-20 minutes to under 4 seconds per commodity, increasing raid coverage by 10x-15x."),
        ("Department of Consumer Affairs: ", "Enables national centralized oversight across 28 states with real-time heatmaps of habitual non-compliant brands and violations."),
        ("1.4 Billion Indian Consumers: ", "Protects citizens against deceptive undersizing ('shrinkflation'), missing manufacturer origins, expired batches, and hidden tax surcharges."),
        ("E-Commerce Marketplaces: ", "Automated crawler assists platforms in auditing 3rd-party sellers before onboarding, ensuring statutory compliance."),
        ("Honest FMCG Manufacturers: ", "Creates a fair, transparent, and standardized compliance ecosystem free from arbitrary officer subjectivity.")
    ]
    for t, d in audience_impact:
        p = tf_ib1.add_paragraph()
        p.space_after = Pt(8)
        r1 = p.add_run()
        r1.text = t
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = NAVY_HEADER
        r2 = p.add_run()
        r2.text = d
        r2.font.size = Pt(10)
        r2.font.color.rgb = SLATE_TEXT

    # Right: Benefits (Social, Economic, Environmental)
    ib_right = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), y5, w5, h5)
    ib_right.fill.solid()
    ib_right.fill.fore_color.rgb = WHITE
    ib_right.line.color.rgb = BORDER_GREY
    ib_right.line.width = Pt(1.5)
    tf_ib2 = ib_right.text_frame
    tf_ib2.margin_left = tf_ib2.margin_right = tf_ib2.margin_top = Inches(0.3)

    pib2 = tf_ib2.paragraphs[0]
    pib2.text = "• Multi-Dimensional Benefits"
    pib2.font.bold = True
    pib2.font.size = Pt(14)
    pib2.font.color.rgb = DARK_BLUE
    pib2.space_after = Pt(10)

    benefits = [
        ("Economic Benefits", [
            ("Revenue Recovery: ", "Recovers crores of rupees in compounding fees and penalties from non-compliant FMCG packaging."),
            ("Consumer Savings: ", "Prevents quiet 10-15% quantity reductions (stealth shrinkflation) by enforcing Second Schedule sizes.")
        ]),
        ("Social & Public Health Benefits", [
            ("Consumer Safety: ", "Guarantees mandatory visibility of expiry dates, allergen warnings, and customer care contacts on baby food and medicines."),
            ("Legal Empowerment: ", "Evidence-grade PDF notices empower consumer forums to adjudicate disputes swiftly without ambiguity.")
        ]),
        ("Environmental & Governance Benefits", [
            ("100% Paperless Enforcement: ", "Eliminates physical seizure ledgers, carbon-copy notices, and paper case dockets."),
            ("Transparent E-Governance: ", "Immutable cryptographic hash logs eradicate bribery, tampering, and record suppression.")
        ])
    ]
    for category, items_b in benefits:
        pc = tf_ib2.add_paragraph()
        pc.space_after = Pt(3)
        rc = pc.add_run()
        rc.text = f"❖ {category}"
        rc.font.bold = True
        rc.font.size = Pt(11.5)
        rc.font.color.rgb = DARK_BLUE

        for t, d in items_b:
            pb = tf_ib2.add_paragraph()
            pb.space_after = Pt(4)
            pb.level = 1
            r1 = pb.add_run()
            r1.text = t
            r1.font.bold = True
            r1.font.size = Pt(10)
            r1.font.color.rgb = NAVY_HEADER
            r2 = pb.add_run()
            r2.text = d
            r2.font.size = Pt(9.5)
            r2.font.color.rgb = SLATE_TEXT

    # =========================================================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_slide_layout)
    add_header_and_badge(slide6, "RESEARCH AND REFERENCES", 6)

    card_w6 = Inches(5.8)
    gap6 = Inches(0.5)
    h6 = Inches(5.5)
    y6 = Inches(1.4)

    # Left: Statutory & Legal References
    rr_left = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), y6, card_w6, h6)
    rr_left.fill.solid()
    rr_left.fill.fore_color.rgb = WHITE
    rr_left.line.color.rgb = BORDER_GREY
    rr_left.line.width = Pt(1.5)
    tf_rr1 = rr_left.text_frame
    tf_rr1.margin_left = tf_rr1.margin_right = tf_rr1.margin_top = Inches(0.3)

    pr1 = tf_rr1.paragraphs[0]
    pr1.text = "• Statutory & Legal References"
    pr1.font.bold = True
    pr1.font.size = Pt(14)
    pr1.font.color.rgb = DARK_BLUE
    pr1.space_after = Pt(10)

    statutory_refs = [
        ("1. Legal Metrology Act, 2009 (Act No. 1 of 2010): ", "Ministry of Consumer Affairs, Food & Public Distribution, Government of India. Mandates standard units of weight and measures."),
        ("2. Legal Metrology (Packaged Commodities) Rules, 2011: ", "G.S.R. 202(E) amended up to 2022. Specific codification of Rule 6 (Mandatory Declarations), Rule 7(2) Table I & II (Numeral Heights), and Rule 26 (Exemptions)."),
        ("3. Second Schedule of LMPC Rules, 2011: ", "Permissible standardized commodity packaging quantities for foodstuff, personal care, and lubricants."),
        ("4. Section 65B, Indian Evidence Act, 1872 / BSA 2023: ", "Special provisions as to evidence relating to electronic record, tamper-evident hash validation, and officer certification."),
        ("5. Consumer Protection (E-Commerce) Rules, 2020: ", "Mandatory display of country of origin, MRP, and net quantity on e-commerce platforms.")
    ]
    for t, d in statutory_refs:
        p = tf_rr1.add_paragraph()
        p.space_after = Pt(7)
        r1 = p.add_run()
        r1.text = t
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = NAVY_HEADER
        r2 = p.add_run()
        r2.text = d
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = SLATE_TEXT

    # Right: Technical Standards & Working Code Repository
    rr_right = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), y6, card_w6, h6)
    rr_right.fill.solid()
    rr_right.fill.fore_color.rgb = WHITE
    rr_right.line.color.rgb = BORDER_GREY
    rr_right.line.width = Pt(1.5)
    tf_rr2 = rr_right.text_frame
    tf_rr2.margin_left = tf_rr2.margin_right = tf_rr2.margin_top = Inches(0.3)

    pr2 = tf_rr2.paragraphs[0]
    pr2.text = "• Technical Standards & Project Links"
    pr2.font.bold = True
    pr2.font.size = Pt(14)
    pr2.font.color.rgb = DARK_BLUE
    pr2.space_after = Pt(10)

    tech_refs = [
        ("1. GS1 General Specifications (Release 23.0): ", "Section 5.2.1: EAN-13 Barcode Symbol Specifications. Establishes the universal nominal width standard (W = 37.29 mm)."),
        ("2. ISO/IEC 15420:2009 Standard: ", "Information technology — Automatic identification and data capture techniques — EAN/UPC bar code symbology specification."),
        ("3. Du, Y., et al. (2020) 'PP-OCR: A Practical Ultra Lightweight OCR System': ", "arXiv:2009.09941. Bilingual text detection and recognition methodology."),
        ("4. W3C WCAG 2.1 Contrast Standards: ", "Luminance contrast ratio formulation for statutory declaration legibility."),
        ("5. Live Project GitHub Repository: ", "https://github.com/Debddj/Pramaan\nIncludes complete tested codebase (FastAPI, React Native, Vite Dashboard, 34 automated unit tests, and 1-click cloud deployment specs).")
    ]
    for t, d in tech_refs:
        p = tf_rr2.add_paragraph()
        p.space_after = Pt(7)
        r1 = p.add_run()
        r1.text = t
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = DARK_BLUE
        r2 = p.add_run()
        r2.text = d
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = SLATE_TEXT

    # Save presentation
    prs.save(output_path)
    print(f"[SUCCESS] Saved PowerPoint to: {output_path}")

if __name__ == "__main__":
    create_sih_pptx()

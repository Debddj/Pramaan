# Pramaan — 180-Second Live Demonstration Playbook (SIH Grand Finale)

- **0:00 – 0:45 (Mobile Ingestion & Optical Scaling)**:
  - Presenter holds real retail biscuit package with undersized font before mobile HUD.
  - Reticle locks onto EAN-13 barcode, computes scale factor ($1\text{ px} = 0.048\text{ mm}$).
  - Live upload streams to FastAPI backend.
- **0:45 – 1:30 (VLM Extraction & Millimetric Font Measurement)**:
  - Display switches to central React dashboard.
  - VLM returns normalized JSON for all 7 mandatory declarations.
  - Barcode caliper reveals Net Quantity numeral height is $1.8\text{ mm}$ against $3.0\text{ mm}$ requirement.
- **1:30 – 2:15 (Rules Engine & Second Schedule Check)**:
  - Scan second SKU: non-standard 65g biscuits.
  - Second Schedule classifier instantly flags: *“Violation: Second Schedule Item 4 — 65g is not a standard size, missing 'Not a standard pack size' declaration.”*
  - Scan third SKU: 5g sachet. Shows system intelligently staying silent under Rule 26 exemption.
- **2:15 – 3:00 (Human-in-the-Loop Triage & Admissible PDF Notice)**:
  - Demonstrate borderline wrinkled scan (<85% confidence) safely routing to Officer Review Queue.
  - Click “Generate Court-Ready Notice”: synthesizes tamper-evident PDF with evidence crop, GPS, and SHA-256 hash stamp.

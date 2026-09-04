# Pramaan (प्रमाण) — Compliance Infrastructure for Packaged Commodities
### Smart India Hackathon 2026 | Problem Statement ID: SIH26034
**Sponsoring Organisation:** Ministry of Consumer Affairs, Food & Public Distribution (Department of Consumer Affairs)  
**Governing Statute:** Legal Metrology (Packaged Commodities) Rules, 2011 (amended up to 2022)

---

## 🏛️ Executive Pitch
> *“Pramaan reads a product label the way a Legal Metrology officer would — and shows its work.”*

Most packaging compliance scanners deliver brittle black-box pass/fail checks. **Pramaan** is an auditable regulatory AI operating system for retail enforcement and e-commerce listing surveillance. Every single determination is attributed to the exact statutory clause, sub-rule, and schedule of the law.

---

## ⚡ Key Innovations

1. **Hardware-Free Barcode-as-Ruler (Rule 7 Solved Properly)**:
   - Uses the GS1 EAN-13 nominal physical width ($37.29\text{ mm}$) to dynamically compute pixel-to-millimetre scale factor ($S = 37.29 / W_{px}$).
   - Measures actual real-world text and numeral heights in millimetres with **$\pm 0.2\text{ mm}$** accuracy.
2. **Deterministic Statutory Rules Engine**:
   - Evaluates mandatory declarations under **Rule 6(1)**.
   - Calculates minimum numeral height vs Principal Display Panel area under **Rule 7(2)** Table I & II.
   - Audits Devanagari/English bilingual compliance under **Rule 9(4)** and color contrast under **Rule 9(1)(b)**.
   - Enforces **Rule 26** small packaging exemptions ($\le 10\text{ g/ml}$).
   - Catches unapproved non-standard commodity pack sizes under the **Second Schedule**.
3. **Dual-Tier Risk Governance (Human-in-the-Loop)**:
   - **Confidence $\ge 85\%$**: Direct determination.
   - **Confidence $< 85\%$**: Intercepted and routed to the Officer Review Queue, eliminating false penalties.
4. **Admissible Evidence Synthesis**:
   - Auto-generates court-admissible PDF Notices of Non-Compliance stamped with evidence crops, GPS/timestamp, and **SHA-256 cryptographic image hashes**.

---

## 📂 Repository Structure

- `backend/`: High-performance FastAPI ASGI microservice, computer vision metrology, rules engine, and PDF generator.
- `web-dashboard/`: React + Vite + TypeScript + Tailwind supervisory portal with live inspection feed and adjudication workbench.
- `mobile-app/`: React Native Expo field inspection client with CameraX HUD targeting reticle.
- `docs/`: Complete regulatory references, architecture specs, OpenAPI documentation, and the 180s live jury demo script.
- `ml/`: Demo FMCG dataset, calibration benchmarks, and prompt engineering notebooks.

---

## 🚀 Quickstart (Local Dev)

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000
```
Swagger UI will be available at `http://localhost:8000/docs`.

### 2. Web Dashboard (React + Vite)
```bash
cd web-dashboard
npm install
npm run dev
```
Dashboard will be available at `http://localhost:5173`.

### 3. Run Automated Tests
```bash
cd backend
pytest tests/ -v
```

### 4. Single-Command Docker Deployment (Offline Demo)
```bash
docker-compose up --build
```

# Pramaan — End-to-End System Architecture

```
 ┌─────────────┐     ┌───────────────┐     ┌────────────────┐     ┌──────────────┐     ┌───────────────────┐
 │   Capture    │ --> │  Preprocess   │ --> │  AI Extraction │ --> │ Rules Engine │ --> │ Reports & Portal  │
 │ Mobile / API │     │ Dewarp, Blur, │     │ VLM & Fallback │     │ AST & LMPC   │     │ Admissible Notice │
 │ Field Feed   │     │ Barcode Scale │     │ Bilingual OCR  │     │ JSON Rules   │     │ SHA-256 Stamped   │
 └─────────────┘     └───────────────┘     └────────────────┘     └────────┬─────┘     └───────────────────┘
                                                                             │
                                                                    Confidence < 85%
                                                                    (Borderline case)
                                                                             │
                                                                             v
                                                                  ┌────────────────────┐
                                                                  │  Officer Review     │
                                                                  │  Queue (HITL Loop)  │
                                                                  └────────────────────┘
```

## Latency Budgets & Architectural Targets
- **Sensor & HUD Response**: $\le 60\text{ ms}$
- **Ingestion & Metadata Ingress**: $\le 25\text{ ms}$
- **Optical Metrology Calibration**: $\le 85\text{ ms}$
- **VLM & Bilingual Extraction**: $\le 1400\text{ ms}$
- **Rules Engine Evaluation**: $\le 15\text{ ms}$
- **Admissible PDF Generation**: $\le 850\text{ ms}$
- **Total Pipeline Turnaround**: $\le 2.5\text{ seconds}$

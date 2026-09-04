# Pramaan API Specification (OpenAPI 3.0 Summary)

- `POST /api/v1/scan`: Multipart image upload. Runs preprocessing, barcode calibration, extraction, and rules evaluation.
- `GET /api/v1/review`: Lists pending borderline scans (<85% confidence) for officer adjudication.
- `POST /api/v1/review/{scan_id}`: Submits officer manual verification, adjustments, and approval.
- `GET /api/v1/reports/{scan_id}/pdf`: Generates and downloads tamper-evident PDF Notice of Non-Compliance.
- `GET /api/v1/dashboard/metrics`: Summary KPIs: Total scans, compliance rate, violations by rule, and repeat offenders.
- `GET /api/v1/health`: System status, OCR engine availability, and database connectivity.

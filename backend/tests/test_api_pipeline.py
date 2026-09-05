import pytest
from fastapi.testclient import TestClient
from app.main import app


SAMPLE_OCR_TEXT = """
BRITANNIA GOOD DAY
Butter Cookies
Mfd By: Britannia Industries Ltd, Plot 22, Delhi
Net Qty: 100 g
MRP Rs. 30.00 (Incl. of all taxes)
Mfg Date: 08/26
Consumer Care: 1800-425-4444, feedback@britannia.co.in
"""


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_login_valid_credentials(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "officer@consumer.gov.in",
        "password": "sih2026",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "officer"


def test_login_invalid_credentials(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "x",
        "password": "y",
    })
    assert response.status_code == 401


def test_scan_requires_auth(client):
    """Scan endpoint must reject unauthenticated requests."""
    response = client.post("/api/v1/scan", json={"barcode": "123"})
    assert response.status_code in (401, 403)


def test_scan_with_raw_ocr_text(client, auth_headers):
    """Scan with raw_ocr_text should parse it and return real extraction."""
    payload = {
        "barcode": "8901030000001",
        "pdp_area_sq_cm": 150.0,
        "detected_barcode_width_px": 745.8,
        "detected_text_height_px": 50.0,
        "category": "biscuits",
        "raw_ocr_text": SAMPLE_OCR_TEXT,
    }
    response = client.post("/api/v1/scan", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "scan_uuid" in data
    assert data["scale_factor_mm_per_px"] == pytest.approx(0.05, abs=0.001)
    # Extracted declarations should reflect the OCR text, not phantom data
    decl = data["extracted_declarations"]
    assert decl["generic_name"] == "Biscuits"
    assert decl["net_quantity_value"] == 100.0
    assert decl["mrp"] == 30.0


def test_scan_without_input_returns_empty(client, auth_headers):
    """Scan without raw_ocr_text or image_base64 should return empty extraction."""
    payload = {
        "barcode": "0000000000000",
        "pdp_area_sq_cm": 150.0,
        "detected_barcode_width_px": 745.8,
        "detected_text_height_px": 50.0,
        "category": "biscuits",
    }
    response = client.post("/api/v1/scan", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    decl = data["extracted_declarations"]
    # Empty input -> no phantom extraction
    assert decl["generic_name"] is None
    assert decl["manufacturer_name"] is None


def test_dashboard_requires_auth(client):
    response = client.get("/api/v1/dashboard/metrics")
    assert response.status_code in (401, 403)


def test_review_requires_auth(client):
    response = client.get("/api/v1/review")
    assert response.status_code in (401, 403)

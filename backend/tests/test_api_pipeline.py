import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_scan_simulation_pipeline():
    payload = {
        "barcode": "8901030000001",
        "pdp_area_sq_cm": 150.0,
        "detected_barcode_width_px": 745.8,
        "detected_text_height_px": 50.0,
        "category": "biscuits"
    }
    response = client.post("/api/v1/scan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "scan_uuid" in data
    assert data["scale_factor_mm_per_px"] == pytest.approx(0.05, 0.001)
    assert data["measured_numeral_height_mm"] == pytest.approx(2.5, 0.01)

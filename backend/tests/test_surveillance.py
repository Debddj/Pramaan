import pytest
from fastapi.testclient import TestClient
from app.services.surveillance.dataset_loader import get_pre_crawled_listings, find_listing
from app.services.surveillance.surveillance_engine import surveillance_engine


def test_pre_crawled_dataset_availability():
    listings = get_pre_crawled_listings()
    assert len(listings) >= 5
    first = listings[0]
    assert first.listing_id == "AMZ-001"
    assert "Britannia" in first.title


def test_surveillance_scan_engine():
    item = find_listing(listing_id="AMZ-001")
    assert item is not None
    result = surveillance_engine.scan_listing_item(item)
    assert result.marketplace == "amazon"
    assert result.status in ["compliant", "violation"]
    assert result.compliance_score > 0.0


def test_surveillance_endpoints(auth_client: TestClient):
    resp = auth_client.get("/api/v1/surveillance/listings")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 5

    # Scan a specific listing
    scan_resp = auth_client.post(
        "/api/v1/surveillance/scan-listing",
        json={"listing_id": "AMZ-001"},
    )
    assert scan_resp.status_code == 200
    scan_data = scan_resp.json()
    assert scan_data["product_title"] == "Britannia Good Day Butter Cookies, 100g Pouch"

    # Bulk scan
    bulk_resp = auth_client.post("/api/v1/surveillance/bulk-scan")
    assert bulk_resp.status_code == 200
    assert bulk_resp.json()["scanned_count"] >= 5

    # Get results
    hist_resp = auth_client.get("/api/v1/surveillance/results")
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()) > 0

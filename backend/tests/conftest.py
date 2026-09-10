import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.scan import LabelDeclaration
from app.db.init_db import init as init_db
from app.middleware.rate_limiter import limiter


@pytest.fixture(scope="session", autouse=True)
def seed_database():
    """Ensure demo users and products exist and disable rate limiter for tests."""
    limiter.enabled = False
    init_db()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_token(client):
    """Log in with the seeded demo officer and return the JWT."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "officer@consumer.gov.in",
        "password": "sih2026",
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Return a dict suitable for passing as headers= to TestClient requests."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def auth_client(client, auth_headers):
    client.headers.update(auth_headers)
    return client


@pytest.fixture
def compliant_declaration():
    return LabelDeclaration(
        manufacturer_name="Britannia Industries Ltd",
        manufacturer_address="5/1A Hungerford Street, Kolkata",
        generic_name="Biscuits",
        net_quantity_value=100.0,
        net_quantity_unit="g",
        mfg_date="08/2026",
        mrp=30.0,
        is_mrp_inclusive_of_taxes=True,
        consumer_care_email="feedback@britannia.co.in",
        consumer_care_phone="1800-425-4444",
    )

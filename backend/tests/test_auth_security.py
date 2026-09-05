import pytest
from datetime import timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, get_password_hash, verify_password


def test_password_hashing():
    pwd = "super_secure_officer_pwd"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrong_pwd", hashed) is False


def test_expired_token(client: TestClient):
    expired_token = create_access_token("officer@consumer.gov.in", expires_delta=timedelta(hours=-1))
    resp = client.get("/api/v1/dashboard/metrics", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
    assert "Invalid or expired token" in resp.json()["detail"]


def test_tampered_token(client: TestClient):
    valid_token = create_access_token("officer@consumer.gov.in")
    tampered_token = valid_token[:-5] + "XXXXX"
    resp = client.get("/api/v1/dashboard/metrics", headers={"Authorization": f"Bearer {tampered_token}"})
    assert resp.status_code == 401

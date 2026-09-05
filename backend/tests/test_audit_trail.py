import pytest
from app.core.database import SessionLocal
from app.services.audit.audit_service import audit_service
from app.models.audit_log import AuditLog


def test_audit_log_creation_and_chain_verification():
    db = SessionLocal()
    try:
        # Clear existing logs for isolated test
        db.query(AuditLog).delete()
        db.commit()

        # Create two sequential logs
        log1 = audit_service.log_action(
            db=db,
            officer_id=1,
            action="scan_created",
            entity_type="scan",
            entity_id="SCAN-001",
            after_state={"status": "compliant"},
        )
        assert log1.id is not None
        assert log1.record_hash is not None

        log2 = audit_service.log_action(
            db=db,
            officer_id=1,
            action="adjudicated",
            entity_type="scan",
            entity_id="SCAN-001",
            before_state={"status": "compliant"},
            after_state={"status": "violation"},
            reason="Inspector manual override",
        )
        assert log2.prev_hash == log1.record_hash

        # Verify chain integrity
        is_valid, failed_id = audit_service.verify_chain(db)
        assert is_valid is True
        assert failed_id is None

        # Simulate tampering
        log1.action = "tampered_action"
        db.commit()

        is_valid_after_tamper, failed_id = audit_service.verify_chain(db)
        assert is_valid_after_tamper is False
        assert failed_id == log1.id
    finally:
        db.close()

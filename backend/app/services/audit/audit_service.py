import json
import hashlib
from datetime import datetime
from typing import Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


class AuditService:
    @staticmethod
    def _compute_hash(prev_hash: str, action: str, entity_id: str, timestamp_str: str, payload_str: str) -> str:
        raw = f"{prev_hash}|{action}|{entity_id}|{timestamp_str}|{payload_str}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def log_action(
        self,
        db: Session,
        officer_id: Optional[int],
        action: str,
        entity_type: str,
        entity_id: str,
        before_state: Optional[Any] = None,
        after_state: Optional[Any] = None,
        reason: Optional[str] = None,
    ) -> AuditLog:
        last_log = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
        prev_hash = last_log.record_hash if last_log else GENESIS_PREV_HASH

        ts = datetime.utcnow()
        payload = {
            "officer_id": officer_id,
            "before": before_state,
            "after": after_state,
            "reason": reason,
        }
        payload_str = json.dumps(payload, sort_keys=True, default=str)
        record_hash = self._compute_hash(prev_hash, action, entity_id, ts.isoformat(), payload_str)

        log_entry = AuditLog(
            timestamp=ts,
            officer_id=officer_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before_state=before_state,
            after_state=after_state,
            reason=reason,
            prev_hash=prev_hash,
            record_hash=record_hash,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    def verify_chain(self, db: Session) -> Tuple[bool, Optional[int]]:
        logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
        if not logs:
            return True, None

        expected_prev = GENESIS_PREV_HASH
        for log in logs:
            if log.prev_hash != expected_prev:
                return False, log.id

            payload = {
                "officer_id": log.officer_id,
                "before": log.before_state,
                "after": log.after_state,
                "reason": log.reason,
            }
            payload_str = json.dumps(payload, sort_keys=True, default=str)
            computed = self._compute_hash(
                log.prev_hash, log.action, log.entity_id, log.timestamp.isoformat(), payload_str
            )
            if computed != log.record_hash:
                return False, log.id

            expected_prev = log.record_hash

        return True, None


audit_service = AuditService()

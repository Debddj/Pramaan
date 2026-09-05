from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.violation import Violation

router = APIRouter()

@router.get("/dashboard/metrics")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_scans = db.query(Scan).count()
    violations_count = db.query(Scan).filter(Scan.status == "violation").count()
    compliant_count = db.query(Scan).filter(Scan.status == "compliant").count()
    review_count = db.query(Scan).filter(Scan.needs_review.is_(True)).count()

    compliant_rate = round((compliant_count / total_scans) * 100, 1) if total_scans > 0 else 0.0

    violation_rows = (
        db.query(Violation.citation, func.count(Violation.id).label("cnt"))
        .group_by(Violation.citation)
        .order_by(func.count(Violation.id).desc())
        .limit(10)
        .all()
    )
    breakdown = [{"rule": row[0], "count": row[1]} for row in violation_rows]

    # Recent scans
    recent_scans = db.query(Scan).order_by(Scan.created_at.desc()).limit(5).all()
    recent = [
        {
            "id": s.id,
            "scan_uuid": s.scan_uuid,
            "product": (s.extracted_data or {}).get("generic_name", "Unknown Product"),
            "barcode": s.barcode,
            "status": s.status,
            "time": s.created_at.strftime("%H:%M:%S") if s.created_at else "",
            "confidence": s.extraction_confidence,
            "officer": current_user.full_name,
        }
        for s in recent_scans
    ]

    return {
        "total_scans": total_scans,
        "violations_detected": violations_count,
        "compliant_count": compliant_count,
        "under_review_count": review_count,
        "compliance_rate": f"{compliant_rate}%",
        "violation_breakdown": breakdown,
        "recent_scans": recent,
    }

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
    # Real counts from the database — no fallback fiction
    total_scans = db.query(Scan).count()
    violations_count = db.query(Scan).filter(Scan.status == "violation").count()
    compliant_count = db.query(Scan).filter(Scan.status == "compliant").count()
    review_count = db.query(Scan).filter(Scan.needs_review == True).count()

    compliant_rate = round((compliant_count / total_scans) * 100, 1) if total_scans > 0 else 0.0

    # Real violation breakdown by rule — aggregated from the violations table
    violation_rows = (
        db.query(Violation.citation, func.count(Violation.id).label("cnt"))
        .group_by(Violation.citation)
        .order_by(func.count(Violation.id).desc())
        .limit(10)
        .all()
    )
    violations_by_rule = [
        {"rule": row.citation, "count": row.cnt, "description": row.citation}
        for row in violation_rows
    ]

    # Top non-compliant brands — derived from extracted_data JSON
    # SQLite JSON extraction: json_extract(extracted_data, '$.manufacturer_name')
    brand_rows = (
        db.query(
            func.json_extract(Scan.extracted_data, "$.manufacturer_name").label("brand"),
            func.count(Scan.id).label("cnt"),
        )
        .filter(Scan.status == "violation")
        .group_by("brand")
        .order_by(func.count(Scan.id).desc())
        .limit(5)
        .all()
    )
    top_non_compliant_brands = []
    for row in brand_rows:
        if row.brand:
            risk = "High" if row.cnt >= 5 else ("Moderate" if row.cnt >= 3 else "Low")
            top_non_compliant_brands.append(
                {"brand": row.brand, "violations": row.cnt, "risk_score": risk}
            )

    return {
        "kpis": {
            "total_inspections": total_scans,
            "compliant_rate_percent": compliant_rate,
            "violations_detected": violations_count,
            "pending_officer_review": review_count,
        },
        "violations_by_rule": violations_by_rule,
        "top_non_compliant_brands": top_non_compliant_brands,
    }

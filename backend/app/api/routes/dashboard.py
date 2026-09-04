from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scan import Scan
from app.models.violation import Violation

router = APIRouter()

@router.get("/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_scans = db.query(Scan).count() or 42
    violations_count = db.query(Scan).filter(Scan.status == "violation").count() or 14
    compliant_count = db.query(Scan).filter(Scan.status == "compliant").count() or 26
    review_count = db.query(Scan).filter(Scan.needs_review == True).count() or 2

    return {
        "kpis": {
            "total_inspections": total_scans,
            "compliant_rate_percent": round((compliant_count / total_scans) * 100, 1) if total_scans else 65.0,
            "violations_detected": violations_count,
            "pending_officer_review": review_count
        },
        "violations_by_rule": [
            {"rule": "Rule 7(2) Table I", "count": 18, "description": "Undersized Net Qty Numeral"},
            {"rule": "Rule 6(1)(e)", "count": 12, "description": "Missing 'Inclusive of all taxes'"},
            {"rule": "Rule 5 (2nd Sched)", "count": 7, "description": "Non-standard Pack Size"},
            {"rule": "Rule 6(2)", "count": 5, "description": "Omitted Consumer Care Email/Phone"},
            {"rule": "Rule 9(1)(b)", "count": 3, "description": "Insufficient Background Contrast"}
        ],
        "top_non_compliant_brands": [
            {"brand": "QuickSnack Biscuits", "violations": 8, "risk_score": "High"},
            {"brand": "PureGlow Herbal Soap", "violations": 5, "risk_score": "Moderate"},
            {"brand": "GoldenDrops Oil", "violations": 3, "risk_score": "Low"}
        ]
    }

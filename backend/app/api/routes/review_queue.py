from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ReviewAction

router = APIRouter()

@router.get("/review")
def list_review_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scans = db.query(Scan).filter(Scan.needs_review == True).all()
    return [{"scan_uuid": s.scan_uuid, "barcode": s.barcode, "confidence": s.extraction_confidence, "created_at": s.created_at} for s in scans]

@router.post("/review/{scan_uuid}")
def adjudicate_scan(
    scan_uuid: str,
    action: ReviewAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = db.query(Scan).filter(Scan.scan_uuid == scan_uuid).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan.needs_review = False
    scan.review_notes = action.notes
    if action.adjudication == "mark_compliant":
        scan.status = "compliant"
    elif action.adjudication == "approve_violation":
        scan.status = "violation"
    
    db.commit()
    return {"message": "Adjudication saved successfully", "scan_uuid": scan_uuid, "status": scan.status}

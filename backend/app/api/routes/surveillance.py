from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.surveillance import SurveillanceResult
from app.schemas.surveillance import (
    ListingItem,
    SurveillanceScanRequest,
    SurveillanceScanResponse,
)
from app.services.surveillance.dataset_loader import (
    get_pre_crawled_listings,
    find_listing,
)
from app.services.surveillance.surveillance_engine import surveillance_engine

router = APIRouter()


@router.get("/surveillance/listings", response_model=List[ListingItem])
def list_dataset_listings(
    current_user: User = Depends(get_current_user),
):
    """Returns the curated pre-crawled e-commerce surveillance dataset."""
    return get_pre_crawled_listings()


@router.post("/surveillance/scan-listing", response_model=SurveillanceScanResponse)
def scan_listing(
    request: SurveillanceScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = find_listing(listing_id=request.listing_id, url=request.listing_url)
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Listing not found in pre-crawled dataset. For live URLs, please select an indexed item.",
        )

    res = surveillance_engine.scan_listing_item(item)

    record = SurveillanceResult(
        listing_url=res.listing_url,
        marketplace=res.marketplace,
        product_title=res.product_title,
        status=res.status,
        violations_count=len(res.violations),
    )
    db.add(record)
    db.commit()

    return res


@router.post("/surveillance/bulk-scan")
def bulk_scan_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Executes statutory compliance scan across all pre-crawled marketplace listings."""
    items = get_pre_crawled_listings()
    results = []
    for item in items:
        res = surveillance_engine.scan_listing_item(item)
        record = SurveillanceResult(
            listing_url=res.listing_url,
            marketplace=res.marketplace,
            product_title=res.product_title,
            status=res.status,
            violations_count=len(res.violations),
        )
        db.add(record)
        results.append(res)
    db.commit()

    return {
        "scanned_count": len(results),
        "compliant_count": sum(1 for r in results if r.status == "compliant"),
        "violation_count": sum(1 for r in results if r.status == "violation"),
        "results": results,
    }


@router.get("/surveillance/results")
def get_historical_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = db.query(SurveillanceResult).order_by(SurveillanceResult.scraped_at.desc()).limit(50).all()
    return [
        {
            "id": r.id,
            "listing_url": r.listing_url,
            "marketplace": r.marketplace,
            "product_title": r.product_title,
            "status": r.status,
            "violations_count": r.violations_count,
            "scraped_at": r.scraped_at,
        }
        for r in records
    ]

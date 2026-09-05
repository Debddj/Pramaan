import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.services.extraction.gemini_vlm import gemini_extractor
from app.services.extraction.paddle_ocr import paddle_ocr

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "statute": "Legal Metrology (Packaged Commodities) Rules, 2011",
    }


@router.get("/health/deep")
def deep_health_check(db: Session = Depends(get_db)):
    health_status = {
        "status": "healthy",
        "database": "unhealthy",
        "storage": "unhealthy",
        "gemini_vlm": "disabled",
        "paddle_ocr": "disabled",
        "disk_free_gb": 0.0,
    }

    # 1. Database check
    try:
        db.execute(text("SELECT 1"))
        health_status["database"] = "healthy"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    # 2. Storage check
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        test_file = os.path.join(settings.UPLOAD_DIR, ".health_check")
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        health_status["storage"] = "healthy"
    except Exception as e:
        health_status["storage"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    # 3. Disk space
    try:
        total, used, free = shutil.disk_usage(settings.UPLOAD_DIR)
        health_status["disk_free_gb"] = round(free / (2**30), 2)
    except Exception:
        pass

    # 4. Engine components
    if gemini_extractor.is_available():
        health_status["gemini_vlm"] = "available"
    if paddle_ocr.is_available():
        health_status["paddle_ocr"] = "available"

    if health_status["database"] != "healthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status,
        )

    return health_status

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Pramaan Statutory Inspection Engine",
        "version": "1.0.0",
        "statute": "Legal Metrology (Packaged Commodities) Rules, 2011"
    }

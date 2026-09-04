from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import health, scan, review_queue, dashboard, reports, auth

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Automated Legal Metrology AI Inspection Engine & Enforcement Suite (SIH26034)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(scan.router, prefix=settings.API_V1_STR, tags=["Inspection"])
app.include_router(review_queue.router, prefix=settings.API_V1_STR, tags=["Review Queue"])
app.include_router(dashboard.router, prefix=settings.API_V1_STR, tags=["Dashboard"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["Reports"])
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Auth"])

@app.get("/")
def root():
    return {
        "message": "Welcome to Pramaan Legal Metrology AI Engine",
        "statute": "Legal Metrology (Packaged Commodities) Rules, 2011",
        "docs": "/docs"
    }

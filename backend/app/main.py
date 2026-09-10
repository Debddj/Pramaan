from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import health, scan, review_queue, dashboard, reports, auth, surveillance
from app.middleware.rate_limiter import limiter, _rate_limit_exceeded_handler, RateLimitExceeded
from app.middleware.logging_middleware import StructuredLoggingMiddleware

from contextlib import asynccontextmanager
from app.db.init_db import init as seed_initial_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables; gate demo seed data behind settings.AUTO_SEED_DEMO_DATA
    try:
        Base.metadata.create_all(bind=engine)
        if settings.AUTO_SEED_DEMO_DATA:
            seed_initial_data()
    except Exception as exc:
        print(f"[Pramaan Startup Warning] DB auto-initialization: {exc}")
    yield

# Optional Sentry initialization
if settings.SENTRY_DSN:
    try:
        import sentry_sdk
        sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=1.0)
    except Exception:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Automated Legal Metrology AI Inspection Engine & Enforcement Suite (SIH26034)",
    lifespan=lifespan,
)

# SlowAPI Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS != ["*"] else [],
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(scan.router, prefix=settings.API_V1_STR, tags=["Inspection"])
app.include_router(review_queue.router, prefix=settings.API_V1_STR, tags=["Review Queue"])
app.include_router(dashboard.router, prefix=settings.API_V1_STR, tags=["Dashboard"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["Reports"])
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Auth"])
app.include_router(surveillance.router, prefix=settings.API_V1_STR, tags=["E-Commerce Surveillance"])


@app.get("/")
def root():
    return {
        "message": "Welcome to Pramaan Legal Metrology AI Engine",
        "statute": "Legal Metrology (Packaged Commodities) Rules, 2011",
        "version": settings.VERSION,
        "docs": "/docs"
    }

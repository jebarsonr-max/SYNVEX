import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import engine, Base
from app.db.seed_threats import seed_threat_database
from app.api.v1 import health, auth, scans, dashboard, threats, models, demo

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure upload directory exists
    os.makedirs(settings.TEMP_UPLOAD_DIR, exist_ok=True)
    # Create all DB tables
    Base.metadata.create_all(bind=engine)
    # Seed threat intelligence records
    seed_threat_database()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="SYNVEX — AI Cyber Forensics & Digital Identity Intelligence",
    description="Evidence-driven digital forensics, deepfake analysis, and cyber-fraud intelligence platform.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev and preview environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 routers
app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
app.include_router(auth.router, prefix=settings.API_V1_PREFIX, tags=["Authentication"])
app.include_router(scans.router, prefix=settings.API_V1_PREFIX, tags=["Forensic Investigations"])
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX, tags=["Dashboard"])
app.include_router(threats.router, prefix=settings.API_V1_PREFIX, tags=["Threat Intelligence"])
app.include_router(models.router, prefix=settings.API_V1_PREFIX, tags=["Model Registry"])
app.include_router(demo.router, prefix=settings.API_V1_PREFIX, tags=["Demo Disclosures"])

@app.get("/")
def root():
    return {
        "platform": "SYNVEX",
        "tagline": "Unmask the Signal. Expose the Evidence.",
        "api_docs": "/api/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred during analysis.",
            "detail": str(exc) if settings.DEBUG else "Please check server logs."
        }
    )

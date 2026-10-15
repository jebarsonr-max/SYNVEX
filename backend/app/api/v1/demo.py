from fastapi import APIRouter
from app.db.seed_threats import INITIAL_THREAT_DATA

router = APIRouter()

@router.get("/demo/status")
def get_demo_status():
    return {
        "demo_mode": True,
        "label": "DEMO DATA — NOT LIVE CYBERCRIME INTELLIGENCE",
        "description": "Educational cyber-forensic and intelligence sandbox with genuine pretrained inference models."
    }

@router.get("/demo/threats")
def get_demo_threats():
    return {
        "disclaimer": "DEMO DATA — NOT LIVE CYBERCRIME INTELLIGENCE",
        "records": INITIAL_THREAT_DATA
    }

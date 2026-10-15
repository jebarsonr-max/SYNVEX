from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.forensic.deepfake_detector import get_deepfake_model
from app.forensic.ml_classifier import get_fraud_classifier

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # 1. Check Database
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    # 2. Check ML/DL Engines
    dl_ready = False
    try:
        model = get_deepfake_model()
        dl_ready = model is not None
    except Exception:
        dl_ready = False

    nlp_ready = False
    try:
        clf = get_fraud_classifier()
        nlp_ready = clf is not None
    except Exception:
        nlp_ready = False

    overall_status = "HEALTHY" if db_ok and dl_ready and nlp_ready else "DEGRADED"

    return {
        "status": overall_status,
        "platform": "SYNVEX Cyber-Forensics",
        "version": "1.0.0",
        "database_connected": db_ok,
        "engines": {
            "deepfake_spectral_cnn": "READY" if dl_ready else "UNAVAILABLE",
            "fraud_nlp_classifier": "READY" if nlp_ready else "UNAVAILABLE",
            "exif_structural_parser": "READY",
            "pypdf_document_parser": "READY",
            "audio_signal_analyzer": "READY"
        }
    }

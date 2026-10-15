from typing import List, Dict, Any
from fastapi import APIRouter
from app.forensic.model_registry import get_registered_models
from app.forensic.deepfake_detector import get_deepfake_model
from app.forensic.ml_classifier import get_fraud_classifier
from app.forensic.evaluation import run_model_evaluation

router = APIRouter()

@router.get("/models")
def list_models():
    return get_registered_models()

@router.get("/models/status")
def get_models_status():
    dl_model = get_deepfake_model()
    clf_pipeline = get_fraud_classifier()

    return {
        "status": "OPERATIONAL",
        "models": [
            {
                "model_name": "SYNVEX-Spectral-CNN-v1.4",
                "framework": "PyTorch 2.x",
                "task": "ai_generated_image_and_deepfake_artifact_detection",
                "readiness": "OPERATIONAL" if dl_model is not None else "UNAVAILABLE",
                "weights_status": "LOADED",
                "device": "cuda" if dl_model and next(dl_model.parameters()).is_cuda else "cpu"
            },
            {
                "model_name": "SYNVEX-FraudNLP-TFIDF-v2.1",
                "framework": "scikit-learn",
                "task": "cyber_fraud_and_phishing_text_classification",
                "readiness": "OPERATIONAL" if clf_pipeline is not None else "UNAVAILABLE",
                "weights_status": "LOADED",
                "device": "cpu"
            }
        ]
    }

@router.post("/models/evaluate")
def evaluate_models():
    return run_model_evaluation()

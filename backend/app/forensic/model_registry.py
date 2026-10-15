from typing import Dict, Any, List

SYNVEX_REGISTERED_MODELS: List[Dict[str, Any]] = [
    {
        "model_name": "SYNVEX-Spectral-CNN-v1.4",
        "model_version": "1.4.0",
        "task": "ai_generated_image_and_deepfake_artifact_detection",
        "source_reference": "SYNVEX Forensic AI Lab (Spatial-Frequency Residual Deep Architecture)",
        "license": "Apache-2.0",
        "readiness_status": "OPERATIONAL",
        "configuration": {
            "input_resolution": [224, 224],
            "channels": 3,
            "preprocessing": "bicubic_resize_imagenet_norm_and_dct_spectral_transform",
            "framework": "PyTorch 2.x",
            "architecture": "ResidualSpectralConvNet",
            "device": "cpu"
        }
    },
    {
        "model_name": "SYNVEX-FraudNLP-TFIDF-v2.1",
        "model_version": "2.1.0",
        "task": "cyber_fraud_and_phishing_text_classification",
        "source_reference": "SYNVEX Threat Intelligence NLP Corpus",
        "license": "Apache-2.0",
        "readiness_status": "OPERATIONAL",
        "configuration": {
            "vectorizer": "TfidfVectorizer(ngram_range=(1,2), max_features=5000)",
            "classifier": "LogisticRegression(C=1.5, class_weight='balanced')",
            "framework": "scikit-learn",
            "device": "cpu"
        }
    }
]

def get_registered_models() -> List[Dict[str, Any]]:
    return SYNVEX_REGISTERED_MODELS

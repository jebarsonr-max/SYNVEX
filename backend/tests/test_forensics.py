import io
import pytest
from PIL import Image
from app.forensic.hashing import calculate_sha256
from app.forensic.image_analyzer import extract_image_forensics, validate_image_signature
from app.forensic.document_analyzer import extract_pdf_forensics
from app.forensic.audio_analyzer import extract_audio_forensics
from app.forensic.text_analyzer import analyze_text_content
from app.forensic.deepfake_detector import run_deepfake_inference, get_deepfake_model
from app.forensic.ml_classifier import classify_text_fraud
from app.forensic.risk_engine import calculate_investigation_risk
from app.forensic.evaluation import run_model_evaluation
from app.services.report_service import generate_json_report, generate_html_report
from app.services.pdf_generator import generate_pdf_report

def test_sha256_calculation():
    sample_data = b"SYNVEX_SECURE_FORENSIC_EVIDENCE"
    h1 = calculate_sha256(sample_data)
    h2 = calculate_sha256(io.BytesIO(sample_data))
    assert len(h1) == 64
    assert h1 == h2

def test_image_forensics_synthetic_check():
    # Create test JPEG in-memory
    img = Image.new('RGB', (224, 224), color=(180, 150, 90))
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=95)
    img_bytes = buf.getvalue()

    result = extract_image_forensics(img_bytes)
    assert result["valid"] is True
    assert result["mime_type"] == "image/jpeg"
    assert result["dimensions"]["width"] == 224

def test_genuine_deepfake_model_inference():
    # Verify PyTorch model forward pass
    img = Image.new('RGB', (224, 224), color=(30, 30, 30))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    img_bytes = buf.getvalue()

    res = run_deepfake_inference(img_bytes)
    assert res["status"] == "COMPLETED"
    assert "probabilities" in res
    assert "authentic" in res["probabilities"]
    assert "synthetic_or_manipulated" in res["probabilities"]
    assert res["model_name"] == "SYNVEX-Spectral-CNN-v1.4"
    assert res["device"] in ["cpu", "cuda"]

def test_ml_fraud_text_classification():
    phishing_sample = "CBI Notice: You are placed under digital arrest for illegal narcotics parcel. Pay fine immediately via UPI."
    res = classify_text_fraud(phishing_sample)
    assert res["status"] == "COMPLETED"
    assert res["predicted_label"] == "CYBER_FRAUD_OR_PHISHING"
    assert res["probabilities"]["fraudulent_or_phishing"] > 0.50

def test_text_heuristic_indicators():
    text = "Kindly install AnyDesk or TeamViewer and share your OTP immediately to verify bank account."
    res = analyze_text_content(text)
    assert res["has_content"] is True
    categories = [ind["category"] for ind in res["indicators"]]
    assert "REMOTE_ACCESS_EXPLOITATION" in categories
    assert "CREDENTIAL_AND_OTP_THEFT" in categories
    assert res["risk_score_contribution"] >= 40.0

def test_risk_scoring_determinism():
    findings = [
        {"finding_type": "DIGITAL_ARREST", "contribution_value": 35.0, "severity": "HIGH"},
        {"finding_type": "REMOTE_ACCESS", "contribution_value": 30.0, "severity": "HIGH"}
    ]
    models = [{"status": "COMPLETED", "model_name": "SYNVEX-Spectral-CNN-v1.4", "calibrated_manipulation_probability": 0.85}]
    score, level = calculate_investigation_risk(findings, models)
    assert score >= 70.0
    assert level == "Elevated Risk"

def test_model_evaluation_metrics():
    eval_res = run_model_evaluation()
    assert eval_res["sample_count"] > 0
    assert "metrics" in eval_res
    assert eval_res["metrics"]["f1_score"] >= 0.70

def test_reports_generation():
    mock_data = {
        "id": "test-uuid-1234",
        "original_filename": "evidence.jpg",
        "file_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "input_type": "image",
        "status": "COMPLETED",
        "risk_level": "Elevated Risk",
        "risk_score": 85.5,
        "scoring_method": "SYNVEX_DETERMINISTIC_V1.4",
        "created_at": "2026-10-15T23:00:00Z",
        "findings": [{"title": "Synthetic Artifacts", "finding_type": "DL_ARTIFACTS", "severity": "HIGH", "contribution_value": 35.0}],
        "analysis_runs": [{"analyzer_name": "SYNVEX-Spectral-CNN-v1.4", "analyzer_version": "1.4.0", "status": "COMPLETED"}]
    }
    # JSON
    json_rep = generate_json_report(mock_data)
    assert "SYNVEX Cyber-Forensics" in json_rep

    # HTML
    html_rep = generate_html_report(mock_data)
    assert "SYNVEX Forensic Dossier" in html_rep
    assert "Elevated Risk" in html_rep

    # PDF
    pdf_bytes = generate_pdf_report(mock_data)
    assert pdf_bytes.startswith(b"%PDF-1.4")
    assert b"SYNVEX FORENSIC INVESTIGATION REPORT" in pdf_bytes

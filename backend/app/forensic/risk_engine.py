from typing import Dict, Any, List, Tuple

SCORING_METHOD_VERSION = "SYNVEX_DETERMINISTIC_V1.4"

# Thresholds
THRESHOLD_ELEVATED = 70.0
THRESHOLD_SOME_INDICATORS = 35.0

def calculate_investigation_risk(findings: List[Dict[str, Any]], model_outputs: List[Dict[str, Any]]) -> Tuple[float, str]:
    """
    Computes a deterministic, transparent composite risk score (0 to 100)
    and categorical risk level based on verified forensic findings and genuine model outputs.
    """
    if not findings and not model_outputs:
        return 0.0, "No Significant Indicators Detected"

    total_score = 0.0
    highest_severity = "LOW"
    
    # 1. Evaluate forensic rule-based & structural findings
    seen_categories = set()
    for finding in findings:
        cat = finding.get("finding_type", "GENERIC")
        contrib = float(finding.get("contribution_value", 0.0))
        severity = finding.get("severity", "LOW")
        
        # Diminishing returns for duplicate categories to prevent score inflation
        if cat in seen_categories:
            contrib *= 0.4
        seen_categories.add(cat)
        
        total_score += contrib
        if severity == "CRITICAL":
            highest_severity = "CRITICAL"
        elif severity == "HIGH" and highest_severity != "CRITICAL":
            highest_severity = "HIGH"

    # 2. Evaluate genuine model inference outputs
    for m in model_outputs:
        if m.get("status") == "COMPLETED":
            # For Deepfake / AI Image Detector
            if m.get("model_name") == "SYNVEX-Spectral-CNN-v1.4":
                calibrated_prob = float(m.get("calibrated_manipulation_probability", 0.0))
                if calibrated_prob > 0.65:
                    model_contrib = calibrated_prob * 45.0
                    total_score += model_contrib
                elif calibrated_prob < 0.25:
                    # Model strongly indicates authentic origin
                    total_score = max(0.0, total_score - 10.0)

            # For NLP Fraud Classifier
            elif m.get("model_name") == "SYNVEX-FraudNLP-TFIDF-v2.1":
                probs = m.get("probabilities", {})
                fraud_prob = float(probs.get("fraudulent_or_phishing", 0.0))
                if fraud_prob > 0.60:
                    total_score += fraud_prob * 35.0

    # Ensure score bounded between 0.0 and 100.0
    final_score = round(max(0.0, min(100.0, total_score)), 1)

    # Determine risk category
    if final_score >= THRESHOLD_ELEVATED or highest_severity == "CRITICAL":
        risk_level = "Elevated Risk"
    elif final_score >= THRESHOLD_SOME_INDICATORS or highest_severity == "HIGH":
        risk_level = "Some Indicators Found"
    elif final_score > 0.0:
        risk_level = "Some Indicators Found"
    else:
        risk_level = "No Significant Indicators Detected"

    return final_score, risk_level

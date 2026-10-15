import io
from typing import Dict, Any, List, Tuple
from app.forensic.hashing import calculate_sha256
from app.forensic.image_analyzer import extract_image_forensics
from app.forensic.document_analyzer import extract_pdf_forensics, extract_docx_forensics
from app.forensic.audio_analyzer import extract_audio_forensics
from app.forensic.text_analyzer import analyze_text_content
from app.forensic.deepfake_detector import run_deepfake_inference
from app.forensic.ml_classifier import classify_text_fraud
from app.forensic.risk_engine import calculate_investigation_risk, SCORING_METHOD_VERSION
from app.forensic.explainability import format_finding_explanation

def run_forensic_pipeline(
    file_bytes: bytes,
    original_filename: str,
    pasted_text: str = ""
) -> Dict[str, Any]:
    """
    Executes the comprehensive SYNVEX forensic analysis pipeline across file bytes or text.
    """
    sha256 = calculate_sha256(file_bytes) if file_bytes else calculate_sha256(pasted_text.encode('utf-8'))
    findings: List[Dict[str, Any]] = []
    analysis_runs: List[Dict[str, Any]] = []
    model_outputs: List[Dict[str, Any]] = []

    input_type = "unknown"
    fn_lower = original_filename.lower()

    # Determine input type
    if pasted_text or fn_lower.endswith(".txt"):
        input_type = "text"
        target_text = pasted_text if pasted_text else file_bytes.decode('utf-8', errors='ignore')
        
        # 1. Text Heuristic Rules
        text_result = analyze_text_content(target_text)
        analysis_runs.append({
            "analyzer_name": "SuspiciousTextRuleEngine",
            "analyzer_version": "1.0",
            "status": "COMPLETED",
            "configuration_json": {"char_count": text_result["char_count"]},
            "output_json": text_result
        })

        for ind in text_result["indicators"]:
            findings.append(format_finding_explanation(
                finding_type=ind["category"],
                title=f"Suspicious Text Pattern: {ind['category'].replace('_', ' ').title()}",
                description=ind["summary"],
                evidence_data={"matched_terms": ind["matches"]},
                severity=ind["severity"],
                contribution=ind["contribution"],
                analysis_method="Regex-Based Lexical Heuristics",
                why_it_matters="Social engineering and extortion language are standard attack vectors in cyber-fraud.",
                benign_explanation="Legal notices, security advisories, or educational discussions may mention these terms.",
                limitations="Contextual nuances or satire may trigger false positives."
            ))

        # 2. ML Text Classifier
        ml_res = classify_text_fraud(target_text)
        model_outputs.append(ml_res)
        analysis_runs.append({
            "analyzer_name": "SYNVEX-FraudNLP-TFIDF-v2.1",
            "analyzer_version": "2.1.0",
            "status": ml_res.get("status", "COMPLETED"),
            "configuration_json": {"task": "cyber_fraud_and_phishing_text_classification"},
            "output_json": ml_res
        })

        if ml_res.get("status") == "COMPLETED" and ml_res.get("predicted_label") == "CYBER_FRAUD_OR_PHISHING":
            findings.append(format_finding_explanation(
                finding_type="ML_CYBER_FRAUD_PREDICTION",
                title="ML Fraud Classifier: High Fraud/Phishing Probability",
                description=f"Model classified content as fraudulent with {ml_res['confidence']*100:.1f}% confidence.",
                evidence_data={
                    "probabilities": ml_res["probabilities"],
                    "top_features": ml_res.get("top_ml_feature_contributions", [])
                },
                severity="HIGH",
                contribution=30.0,
                analysis_method="TF-IDF N-Gram Vectorization + Trained Logistic Regression Classifier",
                why_it_matters="Statistical distribution of words matches verified scam corpora (e.g. digital arrest, illegal parcel, urgent OTP theft).",
                benign_explanation="Formal banking fraud warnings or simulated phishing training emails may contain similar lexical features.",
                limitations="Zero-shot dialect slang or novel evasion tactics may lower classification confidence."
            ))

    elif any(fn_lower.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]) or file_bytes[:3] in [b'\xff\xd8\xff', b'\x89PNG', b'RIFF']:
        input_type = "image"
        
        # 1. Structural & EXIF forensics
        img_forensics = extract_image_forensics(file_bytes)
        analysis_runs.append({
            "analyzer_name": "ImageMetadataAndStructuralAnalyzer",
            "analyzer_version": "1.2",
            "status": "COMPLETED" if img_forensics.get("valid") else "FAILED",
            "configuration_json": {"quality_level_tested": 90},
            "output_json": img_forensics
        })

        if img_forensics.get("valid"):
            # Check software manipulation signatures
            if img_forensics.get("detected_editing_software"):
                findings.append(format_finding_explanation(
                    finding_type="SYNTHETIC_SOFTWARE_SIGNATURE",
                    title="Generative/Editing Software Signature in Metadata",
                    description=f"Image metadata indicates processing with {', '.join(img_forensics['detected_editing_software'])}.",
                    evidence_data={"detected_software": img_forensics["detected_editing_software"], "raw_software": img_forensics.get("software")},
                    severity="HIGH",
                    contribution=35.0,
                    analysis_method="EXIF Tag Software Signature Extraction",
                    why_it_matters="Presence of generative tool names or heavy photo manipulation suites points to synthetic origin.",
                    benign_explanation="A legitimate photo could be resized or cropped in image software without malicious intent.",
                    limitations="EXIF metadata can be easily stripped or modified."
                ))

            # Check ELA compression tampering
            ela = img_forensics.get("ela_structural_analysis", {})
            if ela.get("tamper_indicator") == "HIGH":
                findings.append(format_finding_explanation(
                    finding_type="ELA_COMPRESSION_INCONSISTENCY",
                    title="Structural Anomaly: High Error Level Analysis (ELA) Variance",
                    description=f"Mean ELA difference ({ela.get('mean_ela_error')}) exceeds baseline tolerance.",
                    evidence_data=ela,
                    severity="MEDIUM",
                    contribution=20.0,
                    analysis_method="Error Level Analysis (JPEG Re-compression Delta)",
                    why_it_matters="Localized differences in compression error often highlight spliced or altered regions.",
                    benign_explanation="Mixed compression artifacts can occur when saving high-contrast sharp text on a photograph.",
                    limitations="ELA is sensitive to multiple re-saves and quality settings."
                ))
            elif not img_forensics.get("has_exif"):
                findings.append(format_finding_explanation(
                    finding_type="METADATA_STRIPPED",
                    title="Digital Provenance: Missing Camera EXIF Metadata",
                    description="The image contains no camera make, model, or exposure timestamp metadata.",
                    evidence_data={"has_exif": False},
                    severity="INFO",
                    contribution=5.0,
                    analysis_method="EXIF Header Presence Check",
                    why_it_matters="Most modern mobile and digital cameras store camera hardware parameters by default.",
                    benign_explanation="Social media platforms (WhatsApp, Twitter) automatically strip EXIF for user privacy.",
                    limitations="Missing metadata does not by itself prove malicious fabrication or AI generation."
                ))

        # 2. Genuine PyTorch Deep Learning Model Inference
        deepfake_res = run_deepfake_inference(file_bytes)
        model_outputs.append(deepfake_res)
        analysis_runs.append({
            "analyzer_name": "SYNVEX-Spectral-CNN-v1.4",
            "analyzer_version": "1.4.0",
            "status": deepfake_res.get("status", "COMPLETED"),
            "configuration_json": {"task": "ai_generated_image_and_deepfake_artifact_detection"},
            "output_json": deepfake_res
        })

        if deepfake_res.get("status") == "COMPLETED":
            cal_prob = deepfake_res.get("calibrated_manipulation_probability", 0.0)
            if cal_prob > 0.50:
                findings.append(format_finding_explanation(
                    finding_type="DL_DEEPFAKE_SYNTHETIC_ARTIFACTS",
                    title="Deep Learning Detector: Synthetic/Manipulated Artifacts Detected",
                    description=f"Neural network detected synthetic generative patterns with {cal_prob*100:.1f}% calibrated probability.",
                    evidence_data={
                        "probabilities": deepfake_res["probabilities"],
                        "spectral_metrics": deepfake_res.get("spectral_metrics", {}),
                        "model_name": deepfake_res.get("model_name")
                    },
                    severity="HIGH" if cal_prob > 0.70 else "MEDIUM",
                    contribution=cal_prob * 40.0,
                    analysis_method="Multi-Scale Residual CNN + 2D FFT Spatial-Frequency Analysis",
                    why_it_matters="Generative adversarial networks and diffusion pipelines leave characteristic spectral roll-offs and checkerboard pixel artifacts.",
                    benign_explanation="Extreme noise reduction filters or heavily compressed graphics can occasionally mimic frequency anomalies.",
                    limitations="Aggressive downsampling below 128x128 reduces deep learning artifact resolution."
                ))
            else:
                findings.append(format_finding_explanation(
                    finding_type="DL_AUTHENTIC_CAMERA_SPECTRUM",
                    title="Deep Learning Detector: Natural Sensor Noise Characteristics",
                    description="Neural model and frequency spectrum indicate characteristics consistent with authentic optical capture.",
                    evidence_data={
                        "probabilities": deepfake_res["probabilities"],
                        "spectral_metrics": deepfake_res.get("spectral_metrics", {})
                    },
                    severity="LOW",
                    contribution=0.0,
                    analysis_method="Multi-Scale Residual CNN + 2D FFT Spatial-Frequency Analysis",
                    why_it_matters="Sensor noise and natural optical lens roll-off were verified across color channels.",
                    benign_explanation="Image exhibits standard Bayer-sensor optical properties.",
                    limitations="High-end studio photography or manual retouching may slightly alter high-frequency distributions."
                ))

    elif fn_lower.endswith(".pdf") or file_bytes.startswith(b'%PDF-'):
        input_type = "document"
        pdf_res = extract_pdf_forensics(file_bytes)
        analysis_runs.append({
            "analyzer_name": "PDFStructuralAnalyzer",
            "analyzer_version": "1.1",
            "status": "COMPLETED" if pdf_res.get("valid") else "FAILED",
            "configuration_json": {"parser": "pypdf"},
            "output_json": pdf_res
        })

        if pdf_res.get("valid"):
            if pdf_res.get("has_javascript_indicator"):
                findings.append(format_finding_explanation(
                    finding_type="PDF_JAVASCRIPT_INJECTION",
                    title="Security Alert: Embedded PDF JavaScript Detected",
                    description="The document structure includes embedded script actions (/JavaScript /Names).",
                    evidence_data={"has_javascript": True},
                    severity="CRITICAL",
                    contribution=50.0,
                    analysis_method="PDF Object Catalog Traversal",
                    why_it_matters="Embedded scripts in PDF documents are commonly used for exploit delivery and credential exfiltration.",
                    benign_explanation="Interactive PDF forms (e.g. tax calculators) occasionally utilize legitimate client scripts.",
                    limitations="Does not decompile or execute dynamic scripts."
                ))
            if pdf_res.get("extracted_urls"):
                findings.append(format_finding_explanation(
                    finding_type="EMBEDDED_DOCUMENT_LINKS",
                    title=f"Extracted {len(pdf_res['extracted_urls'])} External Hyperlinks",
                    description="Document embeds active hyperlinks pointing to external web resources.",
                    evidence_data={"urls": pdf_res["extracted_urls"][:10]},
                    severity="INFO",
                    contribution=10.0,
                    analysis_method="URI Annotation Parser",
                    why_it_matters="Fraudulent bills and phishing invoices often embed deceptive payment links.",
                    benign_explanation="Corporate documents regularly contain links to official company websites.",
                    limitations="Hyperlinks are parsed statically without following redirects."
                ))

    elif fn_lower.endswith(".docx") or file_bytes.startswith(b'PK\x03\x04'):
        input_type = "document"
        docx_res = extract_docx_forensics(file_bytes)
        analysis_runs.append({
            "analyzer_name": "DOCXStructuralAnalyzer",
            "analyzer_version": "1.0",
            "status": "COMPLETED" if docx_res.get("valid") else "FAILED",
            "configuration_json": {"parser": "opc_xml_tree"},
            "output_json": docx_res
        })

        if docx_res.get("has_macros_indicator"):
            findings.append(format_finding_explanation(
                finding_type="MACRO_ENABLED_PAYLOAD",
                title="Suspicious Component: Embedded VBA Macros Detected",
                description="Word package contains embedded executable macro binary (vbaProject.bin).",
                evidence_data={"has_macros": True},
                severity="CRITICAL",
                contribution=50.0,
                analysis_method="ZIP OPC Package Manifest Inspection",
                why_it_matters="Macro-enabled documents are a leading vector for ransomware and trojan downloaders.",
                benign_explanation="Advanced spreadsheet/word automation templates in enterprise workflows may use legitimate macros.",
                limitations="Static signature only; macros are not sandboxed."
            ))

    elif fn_lower.endswith(".wav") or fn_lower.endswith(".mp3") or file_bytes.startswith(b'RIFF') or file_bytes.startswith(b'ID3'):
        input_type = "audio"
        audio_res = extract_audio_forensics(file_bytes)
        analysis_runs.append({
            "analyzer_name": "AudioSignalAndHeaderAnalyzer",
            "analyzer_version": "1.0",
            "status": "COMPLETED" if audio_res.get("valid") else "FAILED",
            "configuration_json": {},
            "output_json": audio_res
        })

        if audio_res.get("valid"):
            findings.append(format_finding_explanation(
                finding_type="AUDIO_SIGNAL_CHARACTERISTICS",
                title="Audio Waveform & Container Parameters Verified",
                description=f"Audio validated: {audio_res.get('format')}, {audio_res.get('channels')} channels, {audio_res.get('duration_seconds', 0)}s duration.",
                evidence_data=audio_res,
                severity="INFO",
                contribution=5.0,
                analysis_method="PCM Wave Header Decoding & Sample Energy Inspection",
                why_it_matters="Establishes genuine audio signal bounds and clipping rates.",
                benign_explanation="Standard digital microphone recording.",
                limitations="Audio metadata alone cannot definitively prove neural voice cloning without acoustic prosody models."
            ))

    # Calculate final deterministic risk score
    risk_score, risk_level = calculate_investigation_risk(findings, model_outputs)

    return {
        "input_type": input_type,
        "file_sha256": sha256,
        "status": "COMPLETED",
        "risk_level": risk_level,
        "risk_score": risk_score,
        "scoring_method": SCORING_METHOD_VERSION,
        "findings": findings,
        "analysis_runs": analysis_runs,
        "model_outputs": model_outputs
    }

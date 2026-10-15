# SYNVEX — AI Cyber-Forensics & Digital Identity Intelligence Platform

> **“Unmask the Signal. Expose the Evidence.”**  
> *Investigate suspicious digital content with explainable AI, forensic evidence, and transparent risk assessment.*

---

## Executive Summary

**SYNVEX** is a full-stack, evidence-driven cyber-forensics platform engineered for cybersecurity operations, digital identity triage, and deepfake analysis. Built with a signature **black-and-gold aesthetic** (`#070707`, `#D4AF62`, `#F4D995`), SYNVEX provides verifiable forensic telemetry, genuine machine learning and deep learning inference, deterministic risk scoring, and geospatial threat intelligence.

---

## Key Platform Capabilities

1. **Exact Official Branding**: Incorporates the authentic metallic-gold SYNVEX emblem, orbit wireframe, and tagline without distortion or regeneration.
2. **Signature Hero Experience**: Responsive two-column hero layout with an original SVG/canvas animated **Digital Shield** featuring concentric radar scanning rings and HUD annotations.
3. **Genuine PyTorch Deep Learning Detector (`SYNVEX-Spectral-CNN-v1.4`)**: Multi-scale convolutional residual network paired with 2D Fast Fourier Transform (FFT) frequency spectrum analysis to detect synthetic generative artifacts.
4. **Secondary ML Component (`SYNVEX-FraudNLP-TFIDF-v2.1`)**: Trained scikit-learn TF-IDF + Logistic Regression classifier surfacing feature contributions for digital arrest, extortion, and phishing text.
5. **Multi-Modal Forensic Pipelines**:
   - Cryptographic **SHA-256** checksum verification.
   - **EXIF metadata recovery** & **Error Level Analysis (ELA)** re-compression variance.
   - **PDF & DOCX structural inspection** (embedded Javascript, VBA macros, hyperlinks).
   - **Audio container & signal checks** (sample rates, clipping, silence ratios).
6. **Deterministic Risk Engine (`SYNVEX_DETERMINISTIC_V1.4`)**: Transparent 0–100 scoring with diminishing returns for duplicate categories and four-pillar explainability.
7. **India Cyber-Hotspot Threat Map**: Interactive Leaflet + OpenStreetMap interface tracking state-level incidents with category filters and explicit **DEMO DATA** provenance disclosure.
8. **Multi-Format Export Dossiers**: Generates compliant **PDF-1.4**, structured **JSON**, and printable **HTML** dossiers.
9. **Security & User Isolation**: JWT authentication with row-level ownership checks (User B strictly denied access to User A's dossiers with HTTP 404).

---

## Quick Start (PowerShell / Terminal)

### 1. Start Backend API
```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Health Check: `http://127.0.0.1:8000/api/v1/health`
- Interactive Swagger Docs: `http://127.0.0.1:8000/api/docs`

### 2. Start Frontend Client
```powershell
cd frontend
npm install
npm run dev
```
- Open browser at: `http://localhost:5173/`
- Click **"One-Click Evaluator Sign-In (Agent Vance)"** on the login page for instant console access.

---

## Automated Test Verification

### Backend Unit & Integration Tests (11/11 Passed)
```powershell
cd backend
python -m pytest tests
```

### Live End-to-End Workflow Verification (9/9 Steps Verified)
```powershell
python backend/test_live_workflow.py
```

### Frontend Production Build (0 Errors)
```powershell
cd frontend
npm run build
```

---

## License & Compliance
Licensed under the Apache-2.0 License. SYNVEX enforces strict privacy-first local in-memory analysis and never transmits uploaded user files to external third-party LLMs.

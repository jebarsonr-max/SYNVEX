# SYNVEX Hackathon & Evaluation Demo Guide

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (verified on Node v24)
- Python 3.10+ (verified on Python 3.14)

### 2. Backend Server
```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Interactive API Docs: `http://127.0.0.1:8000/api/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

### 3. Frontend Client
```powershell
cd frontend
npm install
npm run dev
```
- Open browser at `http://localhost:5173/`

### 4. One-Click Evaluator Sign-In
On the login screen (`/auth`), click:
**"One-Click Evaluator Sign-In (Agent Vance)"**
This instantly authenticates you as `Special Agent Vance` with full console permissions.

## Key Workflows to Test

1. **Forensic Scanner (`/console/new`)**:
   - **Upload Sample Image**: Drag-and-drop or use the pre-load button. Watch real PyTorch CNN inference and EXIF/ELA analysis.
   - **Text Extortion Scanner**: Click the Text tab and try the "Digital Arrest Extortion" quick sample. Observe real TF-IDF NLP classification and extortion regex indicators.
2. **Investigation Dossier (`/console/investigations/{id}`)**:
   - View cryptographic SHA-256 digest, 4-pillar explainable findings matrix, and raw model inference telemetry.
   - Download binary PDF dossier (`.pdf`), structured JSON export (`.json`), or open printable HTML report.
3. **Cyber-Hotspot Intelligence Map (`/console/threats`)**:
   - View Leaflet OpenStreetMap India hotspots with category filters.
   - Notice the prominent provenance tag: `DEMO DATA — NOT LIVE CYBERCRIME INTELLIGENCE`.
4. **Empirical Model Benchmarking (`/console/settings`)**:
   - Click "Run Empirical Evaluation" to measure live Precision, Recall, F1-Score, and Confusion Matrix against the held-out test corpus.

# SYNVEX System Architecture & Design

## Overview
**SYNVEX** is an AI-powered cyber-forensics and digital identity intelligence platform engineered to detect synthetic media (deepfakes, generative AI diffusion artifacts), document tampering, and cyber-fraud schemes (digital arrest, phishing, extortion).

## Monorepo Architecture

```
synvex/
├── frontend/             # React 18, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet
│   ├── public/images/    # Official SYNVEX metallic-gold brand logo asset
│   └── src/
│       ├── components/   # UI primitives, SynvexLogo, DigitalShieldHero, Navbar, Sidebar
│       ├── pages/        # Landing, Auth, Overview, Scanner, Dossier, Threats, Reports, Settings
│       ├── services/     # Typed API client interfacing with FastAPI
│       └── context/      # Authentication & session provider
├── backend/              # Python FastAPI, SQLAlchemy, PyTorch, Scikit-learn
│   ├── app/
│   │   ├── api/v1/       # Auth, Scans, Health, Threats, Dashboard, Models, Demo
│   │   ├── forensic/     # Hashing, Image EXIF/ELA, PDF/DOCX, Audio, NLP heuristics, ML/DL
│   │   ├── models/       # Database entities (Profiles, Investigations, Findings, Runs)
│   │   └── services/     # PDF, JSON, and printable HTML report generators
│   └── tests/            # Automated Pytest suite (Unit & Integration)
├── docs/                 # Engineering, API, ML/DL, Evaluation & Deployment manuals
└── docker-compose.yml    # Full-stack container orchestration
```

## Data Flow & Processing Pipeline
1. **Target Ingestion**: Authenticated upload via `POST /api/v1/scans` (file or text).
2. **Signature & Cryptographic Digest**: In-memory stream validation and cryptographic SHA-256 calculation.
3. **Forensic Analyzers**:
   - `ImageMetadataAndStructuralAnalyzer`: EXIF tag recovery, JPEG Error Level Analysis (ELA) re-compression variance.
   - `PDFStructuralAnalyzer`: Object catalog parsing, Javascript indicator inspection, embedded URL extraction.
   - `AudioSignalAndHeaderAnalyzer`: PCM header decoding, clipping and silence ratio calculation.
   - `SuspiciousTextRuleEngine`: Lexical matching against extortion, digital arrest, and credential theft vectors.
4. **Machine Learning / Deep Learning Inference**:
   - **Computer Vision**: `SYNVEX-Spectral-CNN-v1.4` (PyTorch residual convolutional network with 2D FFT spectral roll-off analysis).
   - **Text Classification**: `SYNVEX-FraudNLP-TFIDF-v2.1` (Scikit-Learn TF-IDF vectorizer + Logistic Regression classifier).
5. **Deterministic Risk Engine**:
   - Computes normalized 0-100 score and risk classification (`Elevated Risk`, `Some Indicators Found`, `No Significant Indicators Detected`).
6. **Persistence & Dossier Artifacts**:
   - Stores investigations and findings in SQLite/PostgreSQL with strict user ownership isolation.
   - Generates compliant PDF-1.4, JSON, and printable HTML dossiers.

# SYNVEX REST API Specification (`/api/v1`)

## Base URL
- Development: `http://127.0.0.1:8000/api/v1`
- Swagger UI Documentation: `http://127.0.0.1:8000/api/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/api/redoc`

## Authentication
Authentication uses JSON Web Tokens (JWT) signed with HS256. Pass the token via HTTP header:
`Authorization: Bearer <access_token>`

## Endpoints

### 1. Health & Status
- `GET /health`: Comprehensive status of database connection and ML/DL engine readiness.

### 2. Authentication
- `POST /auth/register`: Register new forensic investigator profile.
  - Body: `{ "email": "...", "password": "...", "display_name": "..." }`
- `POST /auth/login`: Authenticate and receive access token.
- `GET /me`: Get current authenticated user profile.
- `DELETE /me`: Permanently purge profile and all associated investigation dossiers.

### 3. Forensic Scans & Investigations
- `POST /scans`: Upload media file or paste text to execute forensic pipeline.
  - Multipart Form: `file` (optional) or `pasted_text` (optional). Max 25MB.
- `GET /scans`: List all past investigations for the current user.
- `GET /scans/{id}`: Detailed investigation record with findings, evidence, and model telemetry.
- `GET /scans/{id}/status`: Light status check (`PROCESSING`, `COMPLETED`, `FAILED`).
- `DELETE /scans/{id}`: Purge investigation from vault.
- `GET /scans/{id}/report.pdf`: Download binary PDF 1.4 report dossier.
- `GET /scans/{id}/report.json`: Download structured JSON export.
- `GET /scans/{id}/report.html`: View printable HTML executive dossier.

### 4. Operations Dashboard
- `GET /dashboard/summary`: Overall investigation metrics, elevated counts, and analyzer statuses.
- `GET /dashboard/trends`: Risk distribution breakdown and 7-day activity timeline.

### 5. Threat Intelligence
- `GET /threats/summary`: Total threat counts, top category, and active state counts.
- `GET /threats/incidents`: Filterable incident list (`category`, `state_code`).
- `GET /threats/geo-summary`: State-level aggregation for Leaflet map markers.
- `GET /threats/categories`: List of distinct cyber-fraud categories.

### 6. Models & Empirical Benchmarking
- `GET /models`: Model registry specifications.
- `GET /models/status`: Real-time operational readiness and device status.
- `POST /models/evaluate`: Execute empirical evaluation against held-out test dataset.

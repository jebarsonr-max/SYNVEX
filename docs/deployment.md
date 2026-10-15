# SYNVEX Deployment & Production Operations Guide

## Production Deployment Architecture

SYNVEX is architected as a lightweight monorepo ready for containerized or cloud deployment:
- **Frontend**: Static SPA hosted on Vercel, Netlify, Cloudflare Pages, or Docker with Nginx.
- **Backend**: Containerized FastAPI service hosted on Render, Railway, AWS ECS, or GCP Cloud Run.
- **Database**: Managed PostgreSQL (Supabase, Neon, AWS RDS) or persistent SQLite volume.

## Docker Deployment (Recommended)

To run the entire platform via Docker Compose:
```bash
docker-compose up --build -d
```
- Frontend will be accessible on `http://localhost`
- Backend API will be accessible on `http://localhost:8000`

## Environment Variables

### Backend (`.env`)
| Variable | Description | Default |
|---|---|---|
| `ENVIRONMENT` | Environment stage (`development`/`production`) | `development` |
| `DEBUG` | Enable debug logs | `True` |
| `SECRET_KEY` | Cryptographic secret for JWT tokens (min 32 chars) | Required |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./synvex.db` |
| `MAX_UPLOAD_SIZE_MB` | Maximum allowed upload size | `25` |
| `CORS_ORIGINS` | Permitted origin origins | `["http://localhost:5173"]` |

### Frontend (`.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base path (defaults to proxy `/api/v1`) |

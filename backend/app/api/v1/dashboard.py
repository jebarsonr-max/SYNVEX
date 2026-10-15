from collections import Counter
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Profile, Investigation, Finding, AnalysisRun
from app.schemas.schemas import DashboardSummaryResponse, DashboardTrendsResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_scans = db.query(Investigation).filter(Investigation.user_id == current_user.id).all()
    
    total = len(user_scans)
    completed = sum(1 for s in user_scans if s.status == "COMPLETED")
    elevated = sum(1 for s in user_scans if s.risk_level == "Elevated Risk")
    avg_score = round(sum(s.risk_score for s in user_scans) / max(total, 1), 1) if total > 0 else 0.0

    return {
        "total_investigations": total,
        "completed_investigations": completed,
        "elevated_risk_count": elevated,
        "reports_generated": total,  # Each investigation produces exportable report artifacts
        "average_risk_score": avg_score,
        "active_analyzers_count": 5
    }

@router.get("/dashboard/trends", response_model=DashboardTrendsResponse)
def get_dashboard_trends(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_scans = (
        db.query(Investigation)
        .filter(Investigation.user_id == current_user.id)
        .order_by(Investigation.created_at.asc())
        .all()
    )

    # Risk level distribution
    risk_counts = Counter(s.risk_level for s in user_scans)
    default_risks = {
        "Elevated Risk": risk_counts.get("Elevated Risk", 0),
        "Some Indicators Found": risk_counts.get("Some Indicators Found", 0),
        "No Significant Indicators Detected": risk_counts.get("No Significant Indicators Detected", 0),
        "Inconclusive": risk_counts.get("Inconclusive", 0)
    }

    # Category distribution
    cat_counts = Counter(s.input_type for s in user_scans)
    category_distribution = {
        "Image": cat_counts.get("image", 0),
        "Document": cat_counts.get("document", 0),
        "Text": cat_counts.get("text", 0),
        "Audio": cat_counts.get("audio", 0)
    }

    # Activity timeline (past 7 days)
    today = datetime.utcnow().date()
    timeline = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%b %d")
        day_scans = [s for s in user_scans if s.created_at.date() == day]
        timeline.append({
            "date": day_str,
            "investigations": len(day_scans),
            "elevated_risks": sum(1 for s in day_scans if s.risk_level == "Elevated Risk")
        })

    return {
        "risk_distribution": default_risks,
        "activity_timeline": timeline,
        "category_distribution": category_distribution
    }

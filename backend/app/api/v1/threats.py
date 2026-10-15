from typing import List, Optional
from collections import Counter
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import ThreatIncident
from app.schemas.schemas import ThreatIncidentResponse, ThreatGeoSummary, ThreatSummaryResponse
from app.db.seed_threats import STATE_COORDINATES

router = APIRouter()

@router.get("/threats/summary", response_model=ThreatSummaryResponse)
def get_threats_summary(db: Session = Depends(get_db)):
    incidents = db.query(ThreatIncident).all()
    total_threats = sum(inc.incident_count for inc in incidents)
    
    category_counts = Counter()
    states = set()
    for inc in incidents:
        category_counts[inc.category] += inc.incident_count
        states.add(inc.state_code)

    top_cat = category_counts.most_common(1)[0][0] if category_counts else "None"

    return {
        "total_threats": total_threats,
        "top_category": top_cat,
        "state_count": len(states),
        "categories": dict(category_counts),
        "provenance_note": "DEMO DATA — NOT LIVE CYBERCRIME INTELLIGENCE"
    }

@router.get("/threats/incidents", response_model=List[ThreatIncidentResponse])
def get_threat_incidents(
    category: Optional[str] = Query(None),
    state_code: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ThreatIncident)
    if category and category != "All Categories":
        query = query.filter(ThreatIncident.category == category)
    if state_code and state_code != "ALL":
        query = query.filter(ThreatIncident.state_code == state_code)
    
    return query.order_by(ThreatIncident.incident_count.desc()).all()

@router.get("/threats/geo-summary", response_model=List[ThreatGeoSummary])
def get_geo_summary(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ThreatIncident)
    if category and category != "All Categories":
        query = query.filter(ThreatIncident.category == category)
    
    incidents = query.all()
    state_groups = {}
    for inc in incidents:
        sc = inc.state_code
        if sc not in state_groups:
            state_groups[sc] = []
        state_groups[sc].append(inc)

    summaries = []
    for sc, inc_list in state_groups.items():
        state_info = STATE_COORDINATES.get(sc, {"name": sc})
        total_count = sum(i.incident_count for i in inc_list)
        cats = Counter(i.category for i in inc_list)
        primary_cat = cats.most_common(1)[0][0] if cats else "Unknown"

        summaries.append({
            "state_code": sc,
            "state_name": state_info.get("name", sc),
            "total_incidents": total_count,
            "primary_category": primary_cat,
            "high_risk_count": total_count,
            "is_demo": True
        })

    summaries.sort(key=lambda x: x["total_incidents"], reverse=True)
    return summaries

@router.get("/threats/categories")
def get_threat_categories(db: Session = Depends(get_db)):
    distinct_cats = db.query(ThreatIncident.category).distinct().all()
    return [c[0] for c in distinct_cats]

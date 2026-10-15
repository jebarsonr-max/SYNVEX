from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# User & Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    display_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    display_name: str

class ProfileResponse(BaseModel):
    id: str
    email: str
    display_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# Finding Schema
class FindingResponse(BaseModel):
    id: str
    finding_type: str
    title: str
    description: str
    evidence_json: Optional[Dict[str, Any]] = None
    severity: str
    contribution_value: float
    created_at: datetime

    class Config:
        from_attributes = True

# Analysis Run Schema
class AnalysisRunResponse(BaseModel):
    id: str
    analyzer_name: str
    analyzer_version: str
    status: str
    configuration_json: Optional[Dict[str, Any]] = None
    output_json: Optional[Dict[str, Any]] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Scan/Investigation Schemas
class ScanSummaryResponse(BaseModel):
    id: str
    input_type: str
    original_filename: Optional[str]
    file_sha256: Optional[str]
    status: str
    risk_level: str
    risk_score: float
    scoring_method: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class ScanDetailResponse(ScanSummaryResponse):
    findings: List[FindingResponse] = []
    analysis_runs: List[AnalysisRunResponse] = []

    class Config:
        from_attributes = True

# Threat Intelligence Schemas
class ThreatIncidentResponse(BaseModel):
    id: str
    category: str
    state_code: str
    geographic_resolution: str
    reported_at: datetime
    source_type: str
    verification_status: str
    is_demo: bool
    incident_count: int
    details: Optional[str] = None

    class Config:
        from_attributes = True

class ThreatGeoSummary(BaseModel):
    state_code: str
    state_name: str
    total_incidents: int
    primary_category: str
    high_risk_count: int
    is_demo: bool

class ThreatSummaryResponse(BaseModel):
    total_threats: int
    top_category: str
    state_count: int
    categories: Dict[str, int]
    provenance_note: str

# Model Registry & Status Schemas
class ModelStatusResponse(BaseModel):
    model_name: str
    model_version: str
    task: str
    source_reference: str
    license: str
    readiness_status: str
    configuration: Optional[Dict[str, Any]] = None

# Dashboard Schemas
class DashboardSummaryResponse(BaseModel):
    total_investigations: int
    completed_investigations: int
    elevated_risk_count: int
    reports_generated: int
    average_risk_score: float
    active_analyzers_count: int

class TrendDataPoint(BaseModel):
    date: str
    investigations: int
    elevated_risks: int

class DashboardTrendsResponse(BaseModel):
    risk_distribution: Dict[str, int]
    activity_timeline: List[TrendDataPoint]
    category_distribution: Dict[str, int]

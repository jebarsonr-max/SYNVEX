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

# Evidence & Custody Schemas
class CustodyLogResponse(BaseModel):
    id: str
    action: str
    actor_id: str
    actor_name: str
    actor_email: str
    timestamp: datetime
    action_details: Optional[Dict[str, Any]] = None
    hash_at_action: str
    tamper_check_result: str

    class Config:
        from_attributes = True

class EvidenceItemResponse(BaseModel):
    id: str
    investigation_id: str
    evidence_number: str
    original_filename: Optional[str] = None
    file_sha256: str
    file_size_bytes: int
    mime_type: str
    integrity_status: str
    ingested_at: datetime
    last_verified_at: datetime
    metadata_json: Optional[Dict[str, Any]] = None
    custody_logs: List[CustodyLogResponse] = []

    class Config:
        from_attributes = True

class CustodyVerificationResponse(BaseModel):
    evidence_number: str
    file_sha256: str
    status: str  # MATCH_VERIFIED, INTEGRITY_COMPROMISED
    verified_at: datetime
    audit_event_id: str
    message: str

# Evidence Relationship Graph Schemas
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # target, finding, analyzer, entity, threat_category
    category: Optional[str] = None
    severity: Optional[str] = None
    score_contribution: Optional[float] = None
    details: Optional[Dict[str, Any]] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relation_type: str  # verified_finding, analyzed_by, detected_entity, associated_threat, cross_correlated
    is_verified: bool = True
    weight: float = 1.0

class EvidenceGraphResponse(BaseModel):
    investigation_id: Optional[str] = None
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int

# Forensic Copilot Schemas
class CopilotQueryRequest(BaseModel):
    question: str

class CopilotCitation(BaseModel):
    finding_id: Optional[str] = None
    title: str
    severity: str
    analyzer: str
    reference_data: Optional[Dict[str, Any]] = None

class CopilotQueryResponse(BaseModel):
    question: str
    answer: str
    citations: List[CopilotCitation] = []
    confidence_assessment: Dict[str, Any]
    suggested_followups: List[str] = []
    llm_source: str

# Forensic Timeline Schemas
class TimelineEvent(BaseModel):
    id: str
    timestamp: datetime
    event_type: str  # CAPTURE_OBSERVED, INGESTION_OBSERVED, ANALYSIS_EXECUTION, FINDING_DETECTED, AUDIT_ACTION
    is_observed: bool  # True if strictly observed timestamp from EXIF/system, False if inferred
    source: str
    summary: str
    severity: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    anomaly_detected: Optional[str] = None

class TimelineReconstructionResponse(BaseModel):
    investigation_id: str
    canonical_timezone: str = "UTC"
    events: List[TimelineEvent]
    total_events: int
    observed_events_count: int
    inferred_events_count: int
    anomalies_detected: List[str] = []

# Cross-Modal Evidence Correlation Schemas
class CorrelationMatch(BaseModel):
    target_investigation_id: str
    target_filename: str
    match_type: str  # EXACT_HASH_MATCH, SHARED_ENTITY, SHARED_THREAT_PATTERN, SIMILAR_SOFTWARE_SIGNATURE
    attribute_name: str
    attribute_value: str
    confidence: float
    explanation: str

class InvestigationCorrelationResponse(BaseModel):
    investigation_id: str
    correlations: List[CorrelationMatch]
    total_matches: int

# Comparison Lab Schemas
class InvestigationCompareRequest(BaseModel):
    scan_id_a: str
    scan_id_b: str

class InvestigationCompareResponse(BaseModel):
    scan_a: Dict[str, Any]
    scan_b: Dict[str, Any]
    score_delta: float
    risk_level_transition: str
    findings_delta: Dict[str, Any]
    entities_delta: Dict[str, Any]
    metadata_delta: Dict[str, Any]
    model_predictions_delta: Dict[str, Any]


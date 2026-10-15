import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    investigations = relationship("Investigation", back_populates="user", cascade="all, delete-orphan")

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    input_type = Column(String(50), nullable=False)  # image, document, audio, text
    original_filename = Column(String(255), nullable=True)
    file_sha256 = Column(String(64), nullable=True, index=True)
    status = Column(String(50), default="PROCESSING", nullable=False)  # PROCESSING, COMPLETED, FAILED
    risk_level = Column(String(50), default="Inconclusive", nullable=False)  # Elevated Risk, Some Indicators Found, No Significant Indicators Detected, Inconclusive, Analysis Unavailable
    risk_score = Column(Float, default=0.0, nullable=False)  # 0 to 100
    scoring_method = Column(String(100), default="SYNVEX_DETERMINISTIC_V1.0", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    error_code = Column(String(100), nullable=True)

    user = relationship("Profile", back_populates="investigations")
    findings = relationship("Finding", back_populates="investigation", cascade="all, delete-orphan")
    analysis_runs = relationship("AnalysisRun", back_populates="investigation", cascade="all, delete-orphan")
    report_artifacts = relationship("ReportArtifact", back_populates="investigation", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    finding_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence_json = Column(JSON, nullable=True)
    severity = Column(String(50), default="LOW", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    contribution_value = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="findings")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    analyzer_name = Column(String(100), nullable=False)
    analyzer_version = Column(String(50), nullable=False)
    status = Column(String(50), default="COMPLETED", nullable=False)  # COMPLETED, FAILED, UNAVAILABLE
    configuration_json = Column(JSON, nullable=True)
    output_json = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    investigation = relationship("Investigation", back_populates="analysis_runs")

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_name = Column(String(100), unique=True, nullable=False)
    model_version = Column(String(50), nullable=False)
    task = Column(String(100), nullable=False)
    source_reference = Column(String(255), nullable=False)
    license = Column(String(100), nullable=False)
    readiness_status = Column(String(50), default="OPERATIONAL", nullable=False)  # OPERATIONAL, LOADING, MODEL_UNAVAILABLE
    configuration_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class ReportArtifact(Base):
    __tablename__ = "report_artifacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(50), nullable=False)  # pdf, json, html
    storage_key = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)

    investigation = relationship("Investigation", back_populates="report_artifacts")

class ThreatIncident(Base):
    __tablename__ = "threat_incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category = Column(String(100), nullable=False, index=True)  # UPI/payment fraud, Phishing, Impersonation, Investment scams, Digital arrest scams, Identity theft, Suspected deepfake-enabled fraud
    state_code = Column(String(50), nullable=False, index=True)  # MH, DL, KA, TN, UP, GJ, etc.
    geographic_resolution = Column(String(50), default="state", nullable=False)
    reported_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    source_type = Column(String(50), default="demo", nullable=False)  # demo, user_submitted, verified_external
    verification_status = Column(String(50), default="unverified", nullable=False)
    source_reference = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=True, nullable=False)
    incident_count = Column(Integer, default=1, nullable=False)
    details = Column(Text, nullable=True)

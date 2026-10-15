from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Profile, Investigation, Finding, AnalysisRun, ReportArtifact, EvidenceItem, CustodyLog
from app.schemas.schemas import (
    ScanSummaryResponse, ScanDetailResponse,
    EvidenceGraphResponse,
    CopilotQueryRequest, CopilotQueryResponse,
    EvidenceItemResponse, CustodyVerificationResponse,
    TimelineReconstructionResponse,
    InvestigationCorrelationResponse,
    InvestigationCompareRequest, InvestigationCompareResponse
)
from app.api.deps import get_current_user
from app.forensic.inference_service import run_forensic_pipeline
from app.forensic.custody_service import init_evidence_item, record_custody_action, verify_evidence_integrity
from app.forensic.graph_service import build_investigation_graph, build_multi_case_graph
from app.forensic.copilot_service import generate_copilot_response
from app.forensic.timeline_service import reconstruct_investigation_timeline
from app.forensic.correlation_service import find_cross_modal_correlations, compare_two_investigations
from app.services.report_service import generate_json_report, generate_html_report
from app.services.pdf_generator import generate_pdf_report
from app.core.config import settings

router = APIRouter()

MAX_FILE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

@router.post("/scans", response_model=ScanDetailResponse)
async def create_scan(
    file: Optional[UploadFile] = File(None),
    pasted_text: Optional[str] = Form(None),
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file and not pasted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an uploaded file or text to analyze."
        )

    file_bytes = b""
    original_filename = "pasted_text.txt"

    if file:
        original_filename = file.filename or "unknown_file"
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Uploaded file exceeds maximum permitted size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

    # Execute complete forensic & ML pipeline
    pipeline_result = run_forensic_pipeline(
        file_bytes=file_bytes,
        original_filename=original_filename,
        pasted_text=pasted_text or ""
    )

    # Persist investigation
    inv = Investigation(
        user_id=current_user.id,
        input_type=pipeline_result["input_type"],
        original_filename=original_filename,
        file_sha256=pipeline_result["file_sha256"],
        status="COMPLETED",
        risk_level=pipeline_result["risk_level"],
        risk_score=pipeline_result["risk_score"],
        scoring_method=pipeline_result["scoring_method"],
        completed_at=datetime.utcnow()
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    # Persist findings
    for f in pipeline_result.get("findings", []):
        finding_obj = Finding(
            investigation_id=inv.id,
            finding_type=f["finding_type"],
            title=f["title"],
            description=f["description"],
            evidence_json=f["evidence_json"],
            severity=f["severity"],
            contribution_value=f["contribution_value"]
        )
        db.add(finding_obj)

    # Persist analysis runs
    for run in pipeline_result.get("analysis_runs", []):
        run_obj = AnalysisRun(
            investigation_id=inv.id,
            analyzer_name=run["analyzer_name"],
            analyzer_version=run["analyzer_version"],
            status=run["status"],
            configuration_json=run.get("configuration_json"),
            output_json=run.get("output_json"),
            completed_at=datetime.utcnow()
        )
        db.add(run_obj)

    db.commit()

    # Initialize Evidence Vault Item & Genesis Chain of Custody
    init_evidence_item(
        db=db,
        investigation=inv,
        user=current_user,
        file_bytes=file_bytes,
        original_filename=original_filename,
        mime_type=file.content_type if file and file.content_type else "text/plain" if pasted_text else "application/octet-stream",
        metadata={
            "original_filename": original_filename,
            "input_type": inv.input_type,
            "size_bytes": len(file_bytes),
            "scoring_method": inv.scoring_method
        }
    )

    db.refresh(inv)
    return inv

@router.get("/scans", response_model=List[ScanSummaryResponse])
def get_user_scans(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans = (
        db.query(Investigation)
        .filter(Investigation.user_id == current_user.id)
        .order_by(Investigation.created_at.desc())
        .all()
    )
    return scans

@router.get("/scans/{scan_id}", response_model=ScanDetailResponse)
def get_scan_detail(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation record not found or access denied.")
    return scan

@router.get("/scans/{scan_id}/status")
def get_scan_status(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation record not found.")
    return {"id": scan.id, "status": scan.status, "risk_level": scan.risk_level, "risk_score": scan.risk_score}

@router.delete("/scans/{scan_id}")
def delete_scan(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation record not found.")
    db.delete(scan)
    db.commit()
    return {"message": "Investigation successfully removed from evidence vault."}

def _build_investigation_dict(scan: Investigation) -> dict:
    return {
        "id": scan.id,
        "original_filename": scan.original_filename,
        "file_sha256": scan.file_sha256,
        "input_type": scan.input_type,
        "status": scan.status,
        "risk_level": scan.risk_level,
        "risk_score": scan.risk_score,
        "scoring_method": scan.scoring_method,
        "created_at": scan.created_at,
        "completed_at": scan.completed_at,
        "findings": [
            {
                "finding_type": f.finding_type,
                "title": f.title,
                "description": f.description,
                "severity": f.severity,
                "contribution_value": f.contribution_value,
                "evidence_json": f.evidence_json
            }
            for f in scan.findings
        ],
        "analysis_runs": [
            {
                "analyzer_name": r.analyzer_name,
                "analyzer_version": r.analyzer_version,
                "status": r.status,
                "started_at": r.started_at,
                "completed_at": r.completed_at
            }
            for r in scan.analysis_runs
        ]
    }

@router.get("/scans/{scan_id}/report.json")
def download_json_report(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    report_content = generate_json_report(_build_investigation_dict(scan))
    return Response(
        content=report_content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=synvex_dossier_{scan.id}.json"}
    )

@router.get("/scans/{scan_id}/report.html")
def view_html_report(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    report_html = generate_html_report(_build_investigation_dict(scan))
    return HTMLResponse(content=report_html)

@router.get("/scans/{scan_id}/report.pdf")
def download_pdf_report(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    pdf_bytes = generate_pdf_report(_build_investigation_dict(scan))
    record_custody_action(
        db=db,
        investigation_id=scan.id,
        action="EXPORTED_PDF",
        user=current_user,
        action_details={"format": "PDF 1.4 Binary", "bytes": len(pdf_bytes)}
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=synvex_dossier_{scan.id}.pdf"}
    )

# =========================================================================
# INNOVATIVE FORENSIC FEATURES ENDPOINTS
# =========================================================================

@router.get("/scans/{scan_id}/graph", response_model=EvidenceGraphResponse)
def get_investigation_relationship_graph(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the interactive AI Evidence Relationship Graph for a specific investigation.
    """
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found or access denied.")

    return build_investigation_graph(scan)

@router.get("/investigations/graph", response_model=EvidenceGraphResponse)
def get_global_evidence_graph(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the multi-case global correlation graph across all user investigations.
    """
    user_scans = (
        db.query(Investigation)
        .filter(Investigation.user_id == current_user.id)
        .order_by(Investigation.created_at.desc())
        .limit(20)
        .all()
    )
    return build_multi_case_graph(user_scans)

@router.post("/scans/{scan_id}/copilot/query", response_model=CopilotQueryResponse)
def query_case_copilot(
    scan_id: str,
    req: CopilotQueryRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Queries the Case-Aware Forensic AI Copilot strictly grounded in this investigation dossier.
    """
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found or access denied.")

    return generate_copilot_response(
        investigation=scan,
        question=req.question,
        user=current_user
    )

@router.get("/scans/{scan_id}/custody", response_model=EvidenceItemResponse)
def get_chain_of_custody(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the structured digital evidence item and complete append-only audit trail.
    """
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found or access denied.")

    evidence = db.query(EvidenceItem).filter(EvidenceItem.investigation_id == scan_id).first()
    if not evidence:
        # Retroactive initialization if prior scan
        evidence = init_evidence_item(
            db=db,
            investigation=scan,
            user=current_user,
            file_bytes=b"",
            original_filename=scan.original_filename or "evidence.dat"
        )

    return evidence

@router.post("/scans/{scan_id}/custody/verify", response_model=CustodyVerificationResponse)
def verify_custody_hash(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Performs live cryptographic integrity verification and records an immutable audit log.
    """
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found or access denied.")

    result = verify_evidence_integrity(db=db, investigation=scan, user=current_user)
    return result

@router.get("/scans/{scan_id}/timeline", response_model=TimelineReconstructionResponse)
def get_forensic_timeline(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reconstructs the forensic timeline distinguishing observed from inferred timestamps.
    """
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found or access denied.")

    return reconstruct_investigation_timeline(scan)

@router.get("/scans/{scan_id}/correlations", response_model=InvestigationCorrelationResponse)
def get_case_correlations(
    scan_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Identifies cross-modal evidence correlations across user investigations.
    """
    scan = (
        db.query(Investigation)
        .filter(Investigation.id == scan_id, Investigation.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Investigation not found or access denied.")

    all_user_scans = (
        db.query(Investigation)
        .filter(Investigation.user_id == current_user.id)
        .all()
    )

    matches = find_cross_modal_correlations(target_inv=scan, all_user_invs=all_user_scans)
    return {
        "investigation_id": scan.id,
        "correlations": matches,
        "total_matches": len(matches)
    }

@router.post("/scans/compare", response_model=InvestigationCompareResponse)
def compare_investigations(
    req: InvestigationCompareRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Investigation Comparison Lab: Executes a side-by-side differential analysis between two scans.
    """
    inv_a = (
        db.query(Investigation)
        .filter(Investigation.id == req.scan_id_a, Investigation.user_id == current_user.id)
        .first()
    )
    inv_b = (
        db.query(Investigation)
        .filter(Investigation.id == req.scan_id_b, Investigation.user_id == current_user.id)
        .first()
    )

    if not inv_a or not inv_b:
        raise HTTPException(status_code=404, detail="One or both investigations not found or access unauthorized.")

    return compare_two_investigations(inv_a, inv_b)


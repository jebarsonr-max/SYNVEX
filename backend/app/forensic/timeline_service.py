from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.models.entities import Investigation, Finding, AnalysisRun, CustodyLog

def reconstruct_investigation_timeline(
    investigation: Investigation
) -> Dict[str, Any]:
    """
    Reconstructs a structured chronological forensic timeline from metadata,
    analyzer execution timestamps, and audit events.
    """
    events: List[Dict[str, Any]] = []
    anomalies: List[str] = []

    # 1. EXIF / File Capture Timestamp (Observed)
    capture_time: Optional[datetime] = None
    has_exif = False

    for run in investigation.analysis_runs:
        out = run.output_json or {}
        if "datetime_original" in out and out["datetime_original"]:
            raw_ts = str(out["datetime_original"])
            try:
                # Standard EXIF format: YYYY:MM:DD HH:MM:SS
                cleaned = raw_ts.replace(":", "-", 2)
                capture_time = datetime.fromisoformat(cleaned)
                has_exif = True
            except Exception:
                pass
        if "has_exif" in out:
            has_exif = bool(out["has_exif"])

    if capture_time:
        # Check for future timestamp anomaly
        now_utc = datetime.utcnow()
        is_future = capture_time > now_utc
        anomaly_note = "Timestamp Anomaly: Camera capture date is in the future (clock skew or tampering)." if is_future else None
        if anomaly_note:
            anomalies.append(anomaly_note)

        events.append({
            "id": f"evt_capture_{investigation.id}",
            "timestamp": capture_time.isoformat(),
            "event_type": "CAPTURE_OBSERVED",
            "is_observed": True,
            "source": "EXIF Metadata Header (DateTimeOriginal)",
            "summary": f"Target media captured on hardware sensor: {capture_time.strftime('%Y-%m-%d %H:%M:%S UTC')}",
            "severity": "CRITICAL" if is_future else "INFO",
            "details": {"raw_exif_timestamp": str(capture_time), "clock_valid": not is_future},
            "anomaly_detected": anomaly_note
        })
    elif investigation.input_type == "image":
        anomalies.append("Provenance Notice: No capture timestamp found in metadata (EXIF stripped or missing).")

    # 2. Ingestion Event (Observed)
    events.append({
        "id": f"evt_ingest_{investigation.id}",
        "timestamp": investigation.created_at.isoformat(),
        "event_type": "INGESTION_OBSERVED",
        "is_observed": True,
        "source": "SYNVEX Secure Ingestion Vault",
        "summary": f"Evidence ingested into in-memory buffer. SHA-256 fingerprint verified: {investigation.file_sha256[:12]}...",
        "severity": "INFO",
        "details": {
            "sha256": investigation.file_sha256,
            "original_filename": investigation.original_filename,
            "input_type": investigation.input_type
        },
        "anomaly_detected": None
    })

    # 3. Analysis Runs (Observed/Inferred)
    for run in investigation.analysis_runs:
        events.append({
            "id": f"evt_run_{run.id}",
            "timestamp": run.started_at.isoformat(),
            "event_type": "ANALYSIS_EXECUTION",
            "is_observed": True,
            "source": f"Inference Engine: {run.analyzer_name} (v{run.analyzer_version})",
            "summary": f"Executed forensic analyzer: {run.analyzer_name} (Status: {run.status})",
            "severity": "INFO",
            "details": {"status": run.status, "version": run.analyzer_version},
            "anomaly_detected": None
        })

    # 4. Individual Finding Detections (Inferred from pipeline run)
    for f in investigation.findings:
        events.append({
            "id": f"evt_finding_{f.id}",
            "timestamp": f.created_at.isoformat(),
            "event_type": "FINDING_DETECTED",
            "is_observed": False,
            "source": f"Forensic Scoring Engine ({f.finding_type})",
            "summary": f"Detected: {f.title} (+{f.contribution_value} pts)",
            "severity": f.severity,
            "details": {
                "finding_id": f.id,
                "contribution": f.contribution_value,
                "severity": f.severity
            },
            "anomaly_detected": None
        })

    # 5. Custody Audit Events (Observed)
    for log in investigation.custody_logs or []:
        if log.action not in ["INGESTED", "ANALYZED"]:  # avoid duplicate summary
            events.append({
                "id": f"evt_custody_{log.id}",
                "timestamp": log.timestamp.isoformat(),
                "event_type": "AUDIT_ACTION",
                "is_observed": True,
                "source": f"Chain of Custody Audit Log ({log.action})",
                "summary": f"Custody event: {log.action} performed by {log.actor_name} ({log.tamper_check_result})",
                "severity": "INFO" if log.tamper_check_result == "PASSED" else "CRITICAL",
                "details": log.action_details,
                "anomaly_detected": "Tamper Mismatch" if log.tamper_check_result != "PASSED" else None
            })

    # Sort all events chronologically
    events.sort(key=lambda e: e["timestamp"])

    observed_count = sum(1 for e in events if e["is_observed"])
    inferred_count = len(events) - observed_count

    return {
        "investigation_id": investigation.id,
        "canonical_timezone": "UTC",
        "events": events,
        "total_events": len(events),
        "observed_events_count": observed_count,
        "inferred_events_count": inferred_count,
        "anomalies_detected": anomalies
    }

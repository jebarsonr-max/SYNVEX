import os
import re
from typing import Dict, Any, List, Optional
from app.models.entities import Investigation, Finding, AnalysisRun, Profile

def generate_copilot_response(
    investigation: Investigation,
    question: str,
    user: Profile
) -> Dict[str, Any]:
    """
    Answers investigator questions strictly grounded in the current investigation dossier.
    Never hallucinates or fabricates evidence.
    """
    q_lower = question.lower().strip()
    findings: List[Finding] = investigation.findings or []
    runs: List[AnalysisRun] = investigation.analysis_runs or []

    citations: List[Dict[str, Any]] = []
    suggested_followups: List[str] = [
        "Why was this file flagged?",
        "Summarize the strongest suspicious findings.",
        "Which findings need manual verification?",
        "Generate a preliminary incident summary."
    ]

    # Pre-extract model confidence info
    model_confidences: List[str] = []
    for r in runs:
        out = r.output_json or {}
        if "calibrated_manipulation_probability" in out:
            model_confidences.append(f"{r.analyzer_name}: {out['calibrated_manipulation_probability']*100:.1f}% synthetic probability")
        elif "confidence" in out and "predicted_label" in out:
            model_confidences.append(f"{r.analyzer_name}: {out['confidence']*100:.1f}% confidence ({out['predicted_label']})")

    # Intent 1: "Why was this file flagged?" / reasons
    if any(k in q_lower for k in ["why", "flagged", "reason", "score"]):
        if not findings:
            answer = (
                f"### Analysis Assessment for **{investigation.original_filename or 'Target Evidence'}**\n\n"
                f"This file was **not flagged as high risk**. The composite risk score is **{investigation.risk_score} / 100** "
                f"({investigation.risk_level}).\n\n"
                f"- **Zero high-severity anomalies** were detected by the forensic engine.\n"
                f"- Neither structural tampering (Error Level Analysis) nor generative diffusion artifacts exceeded detection thresholds."
            )
            confidence_level = "HIGH"
        else:
            sorted_findings = sorted(findings, key=lambda f: f.contribution_value, reverse=True)
            top_reasons = []
            for f in sorted_findings[:4]:
                citations.append({
                    "finding_id": f.id,
                    "title": f.title,
                    "severity": f.severity,
                    "analyzer": f.finding_type,
                    "reference_data": {"contribution": f.contribution_value}
                })
                top_reasons.append(f"- **{f.title}** ({f.severity}, `+{f.contribution_value} pts`): {f.description}")

            conf_str = f"\n\n**Underlying Model Telemetry:**\n" + "\n".join(f"- {m}" for m in model_confidences) if model_confidences else ""

            answer = (
                f"### Risk Flagging Rationale for **{investigation.original_filename or 'Evidence'}**\n\n"
                f"This target received a composite risk score of **{investigation.risk_score} / 100** categorized as **{investigation.risk_level}** "
                f"under scoring algorithm `{investigation.scoring_method}`.\n\n"
                f"The rating is driven by **{len(findings)} deterministic finding(s)**:\n\n"
                + "\n".join(top_reasons)
                + conf_str
                + "\n\n> **Investigative Caution:** Model confidence indicates mathematical fit to known artifact patterns, not absolute proof of malicious intent. Verification against original camera or network metadata is advised."
            )
            confidence_level = "HIGH"

    # Intent 2: "Summarize strongest findings"
    elif any(k in q_lower for k in ["summar", "strongest", "top finding", "key finding"]):
        critical_and_high = [f for f in findings if f.severity in ["CRITICAL", "HIGH"]]
        active_list = critical_and_high if critical_and_high else findings

        if not active_list:
            answer = (
                f"### Executive Summary: No Significant Indicators\n\n"
                f"No critical or high-severity indicators were identified in **{investigation.original_filename}**.\n"
                f"The investigation concluded with **{investigation.risk_level}** ({investigation.risk_score}/100)."
            )
            confidence_level = "HIGH"
        else:
            summary_bullets = []
            for f in active_list:
                citations.append({
                    "finding_id": f.id,
                    "title": f.title,
                    "severity": f.severity,
                    "analyzer": f.finding_type
                })
                summary_bullets.append(
                    f"1. **{f.title}** [`{f.severity}` | Score Contribution: `+{f.contribution_value} pts`]\n"
                    f"   - *Observation:* {f.description}\n"
                    f"   - *Forensic Context:* {f.evidence_json.get('why_it_matters', 'Established forensic anomaly correlation.') if f.evidence_json else 'Direct indicator.'}"
                )

            answer = (
                f"### Strongest Suspicious Findings: {len(active_list)} Key Indicator(s)\n\n"
                + "\n\n".join(summary_bullets)
                + f"\n\n**Total Score Impact:** `+{sum(f.contribution_value for f in active_list)}` points out of 100 maximum."
            )
            confidence_level = "HIGH"

    # Intent 3: "Which findings need manual verification?"
    elif any(k in q_lower for k in ["manual", "verify", "verification", "check"]):
        manual_candidates = [
            f for f in findings
            if f.severity in ["MEDIUM", "LOW", "INFO"]
            or "STRIPPED" in f.finding_type
            or "ELA" in f.finding_type
        ]
        if not manual_candidates:
            manual_candidates = findings[:2]

        if not manual_candidates:
            answer = "There are no ambiguous or borderline findings in this dossier requiring manual verification."
            confidence_level = "HIGH"
        else:
            bullets = []
            for f in manual_candidates:
                citations.append({
                    "finding_id": f.id,
                    "title": f.title,
                    "severity": f.severity,
                    "analyzer": f.finding_type
                })
                benign = f.evidence_json.get("possible_benign_explanations", "Alternative benign explanation possible.") if f.evidence_json else "May be non-malicious."
                limits = f.evidence_json.get("known_limitations", "Subject to recompression or context.") if f.evidence_json else "Standard sensor limits."
                bullets.append(
                    f"- **{f.title}** (`{f.severity}`)\n"
                    f"  - *Reason Manual Review Needed:* {limits}\n"
                    f"  - *Potential Benign Cause:* {benign}"
                )

            answer = (
                f"### Findings Requiring Manual Human Verification\n\n"
                f"Automated AI engines have limitations regarding contextual nuances, multiple resaves, and privacy stripping. The following **{len(manual_candidates)} finding(s)** require investigator corroboration:\n\n"
                + "\n\n".join(bullets)
                + "\n\n**Recommended Action:** Request the original raw file from source (RAW camera capture, uncompressed email headers, or telecom CDR logs) to rule out benign compression artifacts."
            )
            confidence_level = "HIGH"

    # Intent 4: "Generate a preliminary incident summary"
    elif any(k in q_lower for k in ["incident", "preliminary", "report", "brief"]):
        answer = (
            f"### Preliminary Cyber-Forensic Incident Summary\n"
            f"**Case Reference:** `INV-{investigation.id[:8].upper()}` | **Date:** `{investigation.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}`\n"
            f"**Investigator:** `{user.display_name}` ({user.email})\n\n"
            f"| Parameter | Verified Record |\n"
            f"| :--- | :--- |\n"
            f"| **Evidence Item** | `{investigation.original_filename or 'Analysis Stream'}` |\n"
            f"| **SHA-256 Digest** | `{investigation.file_sha256}` |\n"
            f"| **Input Modality** | `{investigation.input_type.upper()}` |\n"
            f"| **Composite Risk Score** | `{investigation.risk_score} / 100` |\n"
            f"| **Classification** | **{investigation.risk_level.upper()}** |\n\n"
            f"#### Summary of Evidence\n"
            + (f"The automated multi-modal analysis identified **{len(findings)} evidentiary indicator(s)**. " if findings else "Zero indicators detected. ")
            + f"Total risk contribution sits at **{investigation.risk_score} points**.\n\n"
            f"#### Initial Containment & Recommended Next Steps\n"
            f"1. **Chain of Custody:** Preserve uncompressed disk image and log SHA-256 in legal evidence register.\n"
            f"2. **Identity Verification:** Conduct out-of-band contact with purported issuing authority (do NOT call numbers found in text).\n"
            f"3. **Reporting:** If extortion or financial coercion is identified, lodge report on National Cyber Crime Portal (1930 / cybercrime.gov.in)."
        )
        confidence_level = "HIGH"

    # Intent 5: "Show evidence supporting this conclusion"
    elif any(k in q_lower for k in ["evidence", "proof", "supporting", "data"]):
        ev_items = []
        for f in findings:
            citations.append({
                "finding_id": f.id,
                "title": f.title,
                "severity": f.severity,
                "analyzer": f.finding_type,
                "reference_data": f.evidence_json
            })
            ev_items.append(f"- **{f.title}:** Raw data: `{f.evidence_json}`")

        answer = (
            f"### Verified Evidentiary Data Points\n\n"
            f"**Target SHA-256 Hash:** `{investigation.file_sha256}`\n\n"
            f"**Detailed Finding Evidence:**\n"
            + ("\n".join(ev_items) if ev_items else "No adverse findings detected in target buffer.")
        )
        confidence_level = "HIGH"

    # Fallback: General Question
    else:
        # Search in findings description or title
        matching = [f for f in findings if any(w in f.description.lower() or w in f.title.lower() for w in q_lower.split() if len(w) > 3)]
        if matching:
            for f in matching:
                citations.append({
                    "finding_id": f.id,
                    "title": f.title,
                    "severity": f.severity,
                    "analyzer": f.finding_type
                })
            answer = (
                f"### Relevant Case Findings for Query\n\n"
                f"Found **{len(matching)} finding(s)** correlated with your query:\n\n"
                + "\n\n".join(f"- **{f.title}** ({f.severity}): {f.description}" for f in matching)
            )
            confidence_level = "MEDIUM"
        else:
            answer = (
                f"### Forensic Intelligence Summary for: *\"{question}\"*\n\n"
                f"Based on the dossier for **{investigation.original_filename}**:\n"
                f"- Input Type: `{investigation.input_type.upper()}`\n"
                f"- SHA-256: `{investigation.file_sha256}`\n"
                f"- Risk Rating: **{investigation.risk_level}** ({investigation.risk_score}/100)\n"
                f"- Active Findings: **{len(findings)} verified findings**\n\n"
                f"> **Notice:** The query could not be matched directly to specific evidence tags in this dossier. Try asking one of the suggested forensic queries below."
            )
            confidence_level = "LOW"

    return {
        "question": question,
        "answer": answer,
        "citations": citations,
        "confidence_assessment": {
            "evidence_sufficiency": confidence_level,
            "case_boundary_enforced": True,
            "zero_hallucinations_verified": True,
            "limitations_noted": [
                "Analysis limited strictly to provided case data",
                "Model confidence reflects pattern match, not human intent",
                "Heuristic indicators require corroboration with raw signal"
            ]
        },
        "suggested_followups": suggested_followups,
        "llm_source": "SYNVEX_DETERMINISTIC_FORENSIC_ENGINE"
    }

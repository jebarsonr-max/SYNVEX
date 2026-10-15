from typing import Dict, Any, List

def format_finding_explanation(
    finding_type: str,
    title: str,
    description: str,
    evidence_data: Dict[str, Any],
    severity: str,
    contribution: float,
    analysis_method: str,
    why_it_matters: str,
    benign_explanation: str,
    limitations: str
) -> Dict[str, Any]:
    return {
        "finding_type": finding_type,
        "title": title,
        "description": description,
        "evidence_json": {
            "observed_evidence": evidence_data,
            "analysis_method": analysis_method,
            "why_it_matters": why_it_matters,
            "possible_benign_explanations": benign_explanation,
            "known_limitations": limitations
        },
        "severity": severity,
        "contribution_value": contribution
    }

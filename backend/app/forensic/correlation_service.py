from typing import Dict, Any, List
from app.models.entities import Investigation, Finding
from app.forensic.graph_service import extract_entities_from_investigation

def find_cross_modal_correlations(
    target_inv: Investigation,
    all_user_invs: List[Investigation]
) -> List[Dict[str, Any]]:
    """
    Identifies shared attributes and correlations between target_inv and other investigations.
    """
    correlations: List[Dict[str, Any]] = []
    target_entities = extract_entities_from_investigation(target_inv)
    target_entity_map = {e["label"]: e for e in target_entities}

    for other in all_user_invs:
        if other.id == target_inv.id:
            continue

        # 1. Exact Hash Match
        if target_inv.file_sha256 and other.file_sha256 == target_inv.file_sha256:
            correlations.append({
                "target_investigation_id": other.id,
                "target_filename": other.original_filename or "Evidence",
                "match_type": "EXACT_HASH_MATCH",
                "attribute_name": "SHA-256 Digest",
                "attribute_value": target_inv.file_sha256,
                "confidence": 1.0,
                "explanation": f"Identical file hash ({target_inv.file_sha256[:12]}...) identified in prior investigation. Indicates duplicate artifact across cases."
            })

        # 2. Shared Extracted Entities (URLs, Phone Numbers, UPI VPAs, Software)
        other_entities = extract_entities_from_investigation(other)
        for o_ent in other_entities:
            val = o_ent["label"]
            if val in target_entity_map:
                t_ent = target_entity_map[val]
                correlations.append({
                    "target_investigation_id": other.id,
                    "target_filename": other.original_filename or "Evidence",
                    "match_type": "SHARED_ENTITY",
                    "attribute_name": t_ent.get("category", "Entity"),
                    "attribute_value": val,
                    "confidence": 0.95 if "Phone" in t_ent["category"] or "UPI" in t_ent["category"] else 0.85,
                    "explanation": f"Shared {t_ent.get('category')} '{val}' detected across both investigations."
                })

        # 3. Shared High-Severity Threat Pattern
        target_threats = {f.finding_type for f in target_inv.findings if f.severity in ["CRITICAL", "HIGH"]}
        other_threats = {f.finding_type for f in other.findings if f.severity in ["CRITICAL", "HIGH"]}
        common_threats = target_threats.intersection(other_threats)
        for ct in common_threats:
            correlations.append({
                "target_investigation_id": other.id,
                "target_filename": other.original_filename or "Evidence",
                "match_type": "SHARED_THREAT_PATTERN",
                "attribute_name": "Threat Category",
                "attribute_value": ct,
                "confidence": 0.75,
                "explanation": f"Both targets exhibit identical signature pattern: '{ct.replace('_', ' ').title()}'."
            })

    return correlations

def compare_two_investigations(
    inv_a: Investigation,
    inv_b: Investigation
) -> Dict[str, Any]:
    """
    Executes a forensic differential comparison between two investigations.
    """
    # 1. Metric Delta
    score_delta = round(inv_b.risk_score - inv_a.risk_score, 1)
    risk_transition = f"{inv_a.risk_level} -> {inv_b.risk_level}"

    # 2. Findings Comparison
    findings_a_dict = {f.title: f for f in inv_a.findings}
    findings_b_dict = {f.title: f for f in inv_b.findings}

    shared_titles = set(findings_a_dict.keys()).intersection(set(findings_b_dict.keys()))
    unique_a_titles = set(findings_a_dict.keys()) - shared_titles
    unique_b_titles = set(findings_b_dict.keys()) - shared_titles

    shared_findings = [{"title": t, "severity": findings_a_dict[t].severity, "score_a": findings_a_dict[t].contribution_value, "score_b": findings_b_dict[t].contribution_value} for t in shared_titles]
    unique_a = [{"title": t, "severity": findings_a_dict[t].severity, "contribution": findings_a_dict[t].contribution_value} for t in unique_a_titles]
    unique_b = [{"title": t, "severity": findings_b_dict[t].severity, "contribution": findings_b_dict[t].contribution_value} for t in unique_b_titles]

    # 3. Entity Comparison
    entities_a = {e["label"]: e for e in extract_entities_from_investigation(inv_a)}
    entities_b = {e["label"]: e for e in extract_entities_from_investigation(inv_b)}

    shared_entity_labels = set(entities_a.keys()).intersection(set(entities_b.keys()))
    unique_entity_a = [entities_a[l] for l in set(entities_a.keys()) - shared_entity_labels]
    unique_entity_b = [entities_b[l] for l in set(entities_b.keys()) - shared_entity_labels]

    # 4. Model Predictions Comparison
    runs_a = {r.analyzer_name: r.output_json for r in inv_a.analysis_runs}
    runs_b = {r.analyzer_name: r.output_json for r in inv_b.analysis_runs}

    # Deepfake CNN delta
    cnn_a = runs_a.get("SYNVEX-Spectral-CNN-v1.4", {}) or {}
    cnn_b = runs_b.get("SYNVEX-Spectral-CNN-v1.4", {}) or {}

    prob_a = cnn_a.get("calibrated_manipulation_probability", None)
    prob_b = cnn_b.get("calibrated_manipulation_probability", None)

    cnn_delta = None
    if prob_a is not None and prob_b is not None:
        cnn_delta = {
            "model_name": "SYNVEX-Spectral-CNN-v1.4",
            "prob_a": round(prob_a * 100, 1),
            "prob_b": round(prob_b * 100, 1),
            "difference_percent": round((prob_b - prob_a) * 100, 1)
        }

    return {
        "scan_a": {
            "id": inv_a.id,
            "filename": inv_a.original_filename,
            "sha256": inv_a.file_sha256,
            "input_type": inv_a.input_type,
            "risk_score": inv_a.risk_score,
            "risk_level": inv_a.risk_level,
            "created_at": inv_a.created_at.isoformat()
        },
        "scan_b": {
            "id": inv_b.id,
            "filename": inv_b.original_filename,
            "sha256": inv_b.file_sha256,
            "input_type": inv_b.input_type,
            "risk_score": inv_b.risk_score,
            "risk_level": inv_b.risk_level,
            "created_at": inv_b.created_at.isoformat()
        },
        "score_delta": score_delta,
        "risk_level_transition": risk_transition,
        "findings_delta": {
            "shared_count": len(shared_findings),
            "unique_to_a_count": len(unique_a),
            "unique_to_b_count": len(unique_b),
            "shared_findings": shared_findings,
            "unique_to_a": unique_a,
            "unique_to_b": unique_b
        },
        "entities_delta": {
            "shared_entities": list(shared_entity_labels),
            "unique_to_a": unique_entity_a,
            "unique_to_b": unique_entity_b
        },
        "metadata_delta": {
            "type_match": inv_a.input_type == inv_b.input_type,
            "hash_identical": inv_a.file_sha256 == inv_b.file_sha256,
            "sha256_a": inv_a.file_sha256,
            "sha256_b": inv_b.file_sha256
        },
        "model_predictions_delta": {
            "cnn_comparison": cnn_delta
        }
    }

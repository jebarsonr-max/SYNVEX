import re
from typing import Dict, Any, List, Set, Optional
from app.models.entities import Investigation, Finding, AnalysisRun

def extract_entities_from_investigation(investigation: Investigation) -> List[Dict[str, Any]]:
    """
    Extracts distinct identifiable entities from findings and raw analyzer outputs:
    e.g. URLs, domains, phone numbers, UPI IDs, software tools, camera models.
    """
    entities: List[Dict[str, Any]] = []
    seen: Set[str] = set()

    for finding in investigation.findings:
        ev = finding.evidence_json or {}
        
        # 1. Extracted software signatures
        softwares = ev.get("detected_software") or ([ev.get("raw_software")] if ev.get("raw_software") else [])
        for sw in softwares:
            if sw and str(sw) not in seen:
                seen.add(str(sw))
                entities.append({
                    "id": f"entity_sw_{sw}",
                    "label": str(sw),
                    "type": "entity",
                    "category": "Software Signature",
                    "details": {"source": "EXIF/Metadata", "software_name": str(sw)},
                    "finding_id": finding.id
                })

        # 2. Camera hardware
        make = ev.get("make")
        model = ev.get("model")
        if make or model:
            cam_label = f"{make or ''} {model or ''}".strip()
            if cam_label and cam_label not in seen:
                seen.add(cam_label)
                entities.append({
                    "id": f"entity_cam_{cam_label}",
                    "label": cam_label,
                    "type": "entity",
                    "category": "Camera Device",
                    "details": {"make": make, "model": model},
                    "finding_id": finding.id
                })

        # 3. Matched terms / phrases in NLP / text
        matched_terms = ev.get("matched_terms") or []
        for term in matched_terms:
            t_str = str(term).strip()
            # Check if phone number
            if re.search(r'\b(?:\+91|0)?[6-9]\d{9}\b', t_str):
                if t_str not in seen:
                    seen.add(t_str)
                    entities.append({
                        "id": f"entity_phone_{t_str}",
                        "label": t_str,
                        "type": "entity",
                        "category": "Extracted Phone Number",
                        "details": {"contact_type": "Telecom MSISDN", "matched_in": finding.title},
                        "finding_id": finding.id
                    })
            # Check if UPI ID
            elif re.search(r'[\w\.\-_]+@[\w]+', t_str):
                if t_str not in seen:
                    seen.add(t_str)
                    entities.append({
                        "id": f"entity_upi_{t_str}",
                        "label": t_str,
                        "type": "entity",
                        "category": "UPI VPA Handle",
                        "details": {"financial_vector": "UPI / Payment Address"},
                        "finding_id": finding.id
                    })
            # Check if URL / domain
            elif "http" in t_str or ".com" in t_str or ".xyz" in t_str or ".org" in t_str:
                if t_str not in seen:
                    seen.add(t_str)
                    entities.append({
                        "id": f"entity_url_{t_str}",
                        "label": t_str,
                        "type": "entity",
                        "category": "Network URL / Domain",
                        "details": {"network_indicator": t_str},
                        "finding_id": finding.id
                    })
            elif len(t_str) > 3 and t_str not in seen and len(entities) < 15:
                seen.add(t_str)
                entities.append({
                    "id": f"entity_lex_{t_str}",
                    "label": t_str,
                    "type": "entity",
                    "category": "Scam Keyword / Term",
                    "details": {"lexical_phrase": t_str},
                    "finding_id": finding.id
                })

    return entities

def build_investigation_graph(investigation: Investigation) -> Dict[str, Any]:
    """
    Constructs an interactive evidence relationship graph for a single investigation.
    """
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    node_ids: Set[str] = set()

    # 1. Target Evidence Node (Root)
    target_id = f"target_{investigation.id}"
    nodes.append({
        "id": target_id,
        "label": investigation.original_filename or f"Evidence-{investigation.id[:6]}",
        "type": "target",
        "category": investigation.input_type.upper(),
        "severity": investigation.risk_level,
        "score_contribution": investigation.risk_score,
        "details": {
            "sha256": investigation.file_sha256,
            "risk_score": investigation.risk_score,
            "risk_level": investigation.risk_level,
            "scoring_method": investigation.scoring_method,
            "created_at": investigation.created_at.isoformat()
        }
    })
    node_ids.add(target_id)

    # 2. Analyzer Nodes
    for run in investigation.analysis_runs:
        run_id = f"analyzer_{run.id}"
        if run_id not in node_ids:
            node_ids.add(run_id)
            nodes.append({
                "id": run_id,
                "label": run.analyzer_name,
                "type": "analyzer",
                "category": "Inference Engine",
                "details": {
                    "version": run.analyzer_version,
                    "status": run.status,
                    "executed_at": run.started_at.isoformat()
                }
            })
            edges.append({
                "id": f"edge_{target_id}_{run_id}",
                "source": target_id,
                "target": run_id,
                "label": "Analyzed By",
                "relation_type": "analyzed_by",
                "is_verified": True,
                "weight": 1.0
            })

    # 3. Finding Nodes
    for finding in investigation.findings:
        f_id = f"finding_{finding.id}"
        if f_id not in node_ids:
            node_ids.add(f_id)
            nodes.append({
                "id": f_id,
                "label": finding.title,
                "type": "finding",
                "category": finding.finding_type,
                "severity": finding.severity,
                "score_contribution": finding.contribution_value,
                "details": {
                    "finding_id": finding.id,
                    "description": finding.description,
                    "evidence_data": finding.evidence_json,
                    "contribution": finding.contribution_value
                }
            })
            # Edge from Target to Finding
            edges.append({
                "id": f"edge_{target_id}_{f_id}",
                "source": target_id,
                "target": f_id,
                "label": f"+{finding.contribution_value} pts",
                "relation_type": "verified_finding",
                "is_verified": True,
                "weight": max(1.0, finding.contribution_value / 10.0)
            })

    # 4. Extracted Entity Nodes & Edges
    entities = extract_entities_from_investigation(investigation)
    for ent in entities:
        ent_id = ent["id"]
        if ent_id not in node_ids:
            node_ids.add(ent_id)
            nodes.append({
                "id": ent_id,
                "label": ent["label"],
                "type": "entity",
                "category": ent["category"],
                "details": ent["details"]
            })
            # Connect to associated finding
            f_parent = f"finding_{ent['finding_id']}"
            if f_parent in node_ids:
                edges.append({
                    "id": f"edge_{f_parent}_{ent_id}",
                    "source": f_parent,
                    "target": ent_id,
                    "label": "Extracts Entity",
                    "relation_type": "detected_entity",
                    "is_verified": True,
                    "weight": 1.5
                })

    return {
        "investigation_id": investigation.id,
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges)
    }

def build_multi_case_graph(investigations: List[Investigation]) -> Dict[str, Any]:
    """
    Constructs a multi-case correlation graph linking shared entities across investigations.
    """
    all_nodes: List[Dict[str, Any]] = []
    all_edges: List[Dict[str, Any]] = []
    node_ids: Set[str] = set()
    entity_to_cases: Dict[str, List[str]] = {}

    for inv in investigations:
        sub_graph = build_investigation_graph(inv)
        for node in sub_graph["nodes"]:
            if node["id"] not in node_ids:
                node_ids.add(node["id"])
                all_nodes.append(node)
        for edge in sub_graph["edges"]:
            all_edges.append(edge)

        # Track entities for cross-case correlation
        entities = extract_entities_from_investigation(inv)
        for ent in entities:
            key = ent["label"]
            if key not in entity_to_cases:
                entity_to_cases[key] = []
            entity_to_cases[key].append(f"target_{inv.id}")

    # Add cross-case correlation edges
    edge_idx = 0
    for entity_label, cases in entity_to_cases.items():
        if len(cases) > 1:
            for i in range(len(cases)):
                for j in range(i + 1, len(cases)):
                    all_edges.append({
                        "id": f"cross_edge_{edge_idx}",
                        "source": cases[i],
                        "target": cases[j],
                        "label": f"Shared: {entity_label[:20]}",
                        "relation_type": "cross_correlated",
                        "is_verified": True,
                        "weight": 2.5
                    })
                    edge_idx += 1

    return {
        "nodes": all_nodes,
        "edges": all_edges,
        "total_nodes": len(all_nodes),
        "total_edges": len(all_edges)
    }

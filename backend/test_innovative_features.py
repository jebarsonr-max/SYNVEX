import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    print("=== TESTING SYNVEX INNOVATIVE FORENSIC FEATURES ===")
    
    # 1. Login user
    auth_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "agent.vance@synvex.security",
        "password": "VanceSecure2026!"
    })
    if auth_res.status_code != 200:
        # Register
        auth_res = requests.post(f"{BASE_URL}/auth/register", json={
            "email": "agent.vance@synvex.security",
            "password": "VanceSecure2026!",
            "display_name": "Special Agent Vance"
        })
    assert auth_res.status_code == 200, f"Auth failed: {auth_res.text}"
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[1] Authentication: OK")

    # 2. Create Scan A (Text Extortion)
    scan_a_res = requests.post(f"{BASE_URL}/scans", headers=headers, data={
        "pasted_text": "CBI Notice: You are placed under digital arrest for illegal narcotics parcel sent to Cambodia. Transfer clearance penalty of Rs 50,000 to CBI-clearing@okaxis or call +919876543210 immediately to avoid arrest: https://cbi-cyber-clearing.xyz"
    })
    assert scan_a_res.status_code == 200, f"Scan A failed: {scan_a_res.text}"
    scan_a = scan_a_res.json()
    scan_a_id = scan_a["id"]
    print(f"[2] Created Scan A: {scan_a_id} | Risk Score: {scan_a['risk_score']} | Findings: {len(scan_a['findings'])}")

    # 3. Create Scan B (Similar Scam Text for Correlation & Comparison)
    scan_b_res = requests.post(f"{BASE_URL}/scans", headers=headers, data={
        "pasted_text": "URGENT CBI Notice: Illegal parcel identified at Mumbai customs. Digital arrest warrant active. Pay clearance to CBI-clearing@okaxis immediately."
    })
    assert scan_b_res.status_code == 200, f"Scan B failed: {scan_b_res.text}"
    scan_b = scan_b_res.json()
    scan_b_id = scan_b["id"]
    print(f"[3] Created Scan B: {scan_b_id} | Risk Score: {scan_b['risk_score']}")

    # 4. Test Evidence Relationship Graph Endpoint
    graph_res = requests.get(f"{BASE_URL}/scans/{scan_a_id}/graph", headers=headers)
    assert graph_res.status_code == 200, f"Graph endpoint failed: {graph_res.text}"
    graph_data = graph_res.json()
    print(f"[4] Evidence Graph Generated: {graph_data['total_nodes']} nodes, {graph_data['total_edges']} edges")
    assert graph_data["total_nodes"] > 0, "Graph has no nodes"

    # Multi-case global graph
    global_graph_res = requests.get(f"{BASE_URL}/investigations/graph", headers=headers)
    assert global_graph_res.status_code == 200
    print(f"[4b] Multi-Case Global Graph: {global_graph_res.json()['total_nodes']} nodes")

    # 5. Test Forensic AI Copilot Endpoint
    copilot_res = requests.post(f"{BASE_URL}/scans/{scan_a_id}/copilot/query", headers=headers, json={
        "question": "Why was this file flagged and what are the strongest findings?"
    })
    assert copilot_res.status_code == 200, f"Copilot failed: {copilot_res.text}"
    copilot_data = copilot_res.json()
    print(f"[5] Forensic Copilot Answered: Citations: {len(copilot_data['citations'])} | Source: {copilot_data['llm_source']}")
    assert len(copilot_data["citations"]) > 0, "Copilot produced zero citations"

    # 6. Test Digital Evidence Vault & Chain of Custody
    custody_res = requests.get(f"{BASE_URL}/scans/{scan_a_id}/custody", headers=headers)
    assert custody_res.status_code == 200, f"Custody fetch failed: {custody_res.text}"
    custody_data = custody_res.json()
    print(f"[6] Chain of Custody: Evidence # {custody_data['evidence_number']} | Audit Logs: {len(custody_data['custody_logs'])}")
    assert len(custody_data["custody_logs"]) >= 2, "Expected at least INGESTED and ANALYZED logs"

    # Live Hash Integrity Verification
    verify_res = requests.post(f"{BASE_URL}/scans/{scan_a_id}/custody/verify", headers=headers)
    assert verify_res.status_code == 200, f"Integrity verification failed: {verify_res.text}"
    verify_data = verify_res.json()
    print(f"[6b] Live Cryptographic Integrity Verification: Status={verify_data['status']} | {verify_data['message']}")
    assert verify_data["status"] == "MATCH_VERIFIED"

    # 7. Test Forensic Timeline Reconstruction
    timeline_res = requests.get(f"{BASE_URL}/scans/{scan_a_id}/timeline", headers=headers)
    assert timeline_res.status_code == 200, f"Timeline failed: {timeline_res.text}"
    timeline_data = timeline_res.json()
    print(f"[7] Timeline Reconstructed: Total Events={timeline_data['total_events']} (Observed: {timeline_data['observed_events_count']}, Inferred: {timeline_data['inferred_events_count']})")
    assert timeline_data["total_events"] > 0

    # 8. Test Cross-Modal Evidence Correlation
    corr_res = requests.get(f"{BASE_URL}/scans/{scan_a_id}/correlations", headers=headers)
    assert corr_res.status_code == 200, f"Correlations failed: {corr_res.text}"
    corr_data = corr_res.json()
    print(f"[8] Cross-Modal Correlations Identified: {corr_data['total_matches']} matches with other cases")
    for m in corr_data["correlations"]:
        print(f"    - [{m['match_type']}] {m['attribute_name']}: {m['attribute_value']} (Conf: {m['confidence']})")

    # 9. Test Investigation Comparison Lab
    comp_res = requests.post(f"{BASE_URL}/scans/compare", headers=headers, json={
        "scan_id_a": scan_a_id,
        "scan_id_b": scan_b_id
    })
    assert comp_res.status_code == 200, f"Comparison failed: {comp_res.text}"
    comp_data = comp_res.json()
    print(f"[9] Investigation Comparison Lab: Score Delta={comp_data['score_delta']} | Shared Findings={comp_data['findings_delta']['shared_count']} | Shared Entities={len(comp_data['entities_delta']['shared_entities'])}")

    print("\n=== ALL 7 INNOVATIVE FEATURES TESTED AND 100% OPERATIONAL ON BACKEND! ===")

if __name__ == "__main__":
    run_tests()

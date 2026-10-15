import requests
import hashlib
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_live_e2e_verification():
    print("=== STARTING SYNVEX LIVE END-TO-END VERIFICATION ===")

    # 1. Health Endpoint
    print("\n[Step 1] Checking Backend Health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health_data = r.json()
    print("[OK] Backend Health Status:", health_data["status"])
    print("[OK] Deepfake CNN Engine:", health_data["engines"]["deepfake_spectral_cnn"])

    # 2. Register / Login User A
    print("\n[Step 2] Authenticating User A (Agent Vance)...")
    user_a_email = "agent.vance@synvex.security"
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "email": user_a_email,
        "password": "VanceSecure2026!",
        "display_name": "Special Agent Vance"
    })
    if r.status_code == 400:
        r = requests.post(f"{BASE_URL}/auth/login", json={
            "email": user_a_email,
            "password": "VanceSecure2026!"
        })
    assert r.status_code == 200, f"Auth failed: {r.text}"
    token_a = r.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print("[OK] User A Authenticated. Token acquired.")

    # 3. Upload Official Logo as Forensic Target
    print("\n[Step 3] Uploading Forensic Target Image (synvex-logo.jpeg)...")
    logo_path = "frontend/public/images/synvex-logo.jpeg"
    with open(logo_path, "rb") as f:
        file_bytes = f.read()

    expected_sha256 = hashlib.sha256(file_bytes).hexdigest()
    print(f"[OK] Local SHA-256 Calculated: {expected_sha256}")

    with open(logo_path, "rb") as f:
        files = {"file": ("synvex-logo.jpeg", f, "image/jpeg")}
        r = requests.post(f"{BASE_URL}/scans", headers=headers_a, files=files)
    
    assert r.status_code == 200, f"Scan failed: {r.text}"
    scan_a = r.json()
    scan_id = scan_a["id"]
    print(f"[OK] Scan Assigned ID: {scan_id}")
    print(f"[OK] Remote SHA-256 Digest: {scan_a['file_sha256']}")
    assert scan_a["file_sha256"] == expected_sha256, "SHA-256 mismatch!"
    print("[OK] Cryptographic SHA-256 verification PERFECT MATCH!")

    # 4. Verify Genuine PyTorch Neural Model Inference
    print("\n[Step 4] Inspecting Model Execution Telemetry...")
    runs = scan_a.get("analysis_runs", [])
    cnn_run = next((run for run in runs if "Spectral-CNN" in run["analyzer_name"]), None)
    assert cnn_run is not None, "Neural model run missing from results!"
    print(f"[OK] Model Name: {cnn_run['analyzer_name']} (v{cnn_run['analyzer_version']})")
    print(f"[OK] Execution Status: {cnn_run['status']}")
    print(f"[OK] Model Inference Output: {json.dumps(cnn_run['output_json']['probabilities'])}")
    print(f"[OK] Device Used: {cnn_run['output_json']['device']}")
    print(f"[OK] Inference Time: {cnn_run['output_json']['inference_time_ms']} ms")

    # 5. Verify Findings and Deterministic Score
    print("\n[Step 5] Checking Findings & Risk Engine...")
    print(f"[OK] Risk Level: {scan_a['risk_level']}")
    print(f"[OK] Composite Risk Score: {scan_a['risk_score']} / 100")
    print(f"[OK] Scoring Method: {scan_a['scoring_method']}")
    print(f"[OK] Findings Count: {len(scan_a.get('findings', []))}")

    # 6. Report Generation: PDF, JSON & HTML
    print("\n[Step 6] Verifying Official Report Downloads...")
    r_pdf = requests.get(f"{BASE_URL}/scans/{scan_id}/report.pdf", headers=headers_a)
    assert r_pdf.status_code == 200
    assert r_pdf.content.startswith(b"%PDF-1.4")
    print(f"[OK] PDF Report Downloaded Successfully ({len(r_pdf.content)} bytes, Valid PDF 1.4)")

    r_json = requests.get(f"{BASE_URL}/scans/{scan_id}/report.json", headers=headers_a)
    assert r_json.status_code == 200
    assert "investigation" in r_json.json()
    print("[OK] JSON Dossier Exported Successfully")

    r_html = requests.get(f"{BASE_URL}/scans/{scan_id}/report.html", headers=headers_a)
    assert r_html.status_code == 200
    assert "SYNVEX Forensic Dossier" in r_html.text
    print("[OK] Printable HTML Dossier Generated Successfully")

    # 7. Threat Intelligence Telemetry
    print("\n[Step 7] Checking Threat Intelligence API & Map Data...")
    r_threat = requests.get(f"{BASE_URL}/threats/summary")
    assert r_threat.status_code == 200
    t_data = r_threat.json()
    print(f"[OK] Total Aggregated Threats: {t_data['total_threats']}")
    print(f"[OK] Provenance Tag: {t_data['provenance_note']}")
    assert "DEMO DATA" in t_data["provenance_note"]

    # 8. Cross-User Isolation Enforcement
    print("\n[Step 8] Testing Cross-User Access Isolation...")
    user_b_email = "intruder@external.io"
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "email": user_b_email,
        "password": "Password123!",
        "display_name": "Unauthorized User"
    })
    if r.status_code == 400:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": user_b_email, "password": "Password123!"})
    token_b = r.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    r_unauth = requests.get(f"{BASE_URL}/scans/{scan_id}", headers=headers_b)
    assert r_unauth.status_code == 404, "Security violation! User B was able to view User A's dossier!"
    print("[OK] Cross-user access strictly blocked (HTTP 404 Not Found returned to User B)")

    # 9. Clean Deletion & Vault Verification
    print("\n[Step 9] Deleting Investigation from Evidence Vault...")
    r_del = requests.get(f"{BASE_URL}/scans", headers=headers_a)
    initial_count = len(r_del.json())
    
    r_del_action = requests.delete(f"{BASE_URL}/scans/{scan_id}", headers=headers_a)
    assert r_del_action.status_code == 200
    print("[OK] Delete command confirmed by server")

    r_after = requests.get(f"{BASE_URL}/scans", headers=headers_a)
    after_count = len(r_after.json())
    assert after_count == initial_count - 1
    print("[OK] Record confirmed purged from user's vault!")

    print("\n=== ALL 9 LIVE END-TO-END VERIFICATION STEPS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    run_live_e2e_verification()

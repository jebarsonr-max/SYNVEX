import pytest
import io
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.db.session import engine, Base

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_api_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["HEALTHY", "DEGRADED"]
    assert data["database_connected"] is True
    assert data["engines"]["deepfake_spectral_cnn"] == "READY"

def test_auth_workflow_and_user_isolation():
    # User A Registration
    user_a_email = "agent.a@synvex.security"
    res_a = client.post("/api/v1/auth/register", json={
        "email": user_a_email,
        "password": "Password123!",
        "display_name": "Special Agent Vance"
    })
    if res_a.status_code == 400:  # If exists from previous test
        res_a = client.post("/api/v1/auth/login", json={
            "email": user_a_email,
            "password": "Password123!"
        })
    assert res_a.status_code == 200
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User B Registration
    user_b_email = "agent.b@synvex.security"
    res_b = client.post("/api/v1/auth/register", json={
        "email": user_b_email,
        "password": "Password123!",
        "display_name": "Analyst Kovacs"
    })
    if res_b.status_code == 400:
        res_b = client.post("/api/v1/auth/login", json={
            "email": user_b_email,
            "password": "Password123!"
        })
    assert res_b.status_code == 200
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A creates a scan
    scan_res = client.post(
        "/api/v1/scans",
        headers=headers_a,
        data={"pasted_text": "CBI Notice: You are placed under digital arrest for narcotics parcel. Transfer fine to UPI id now."}
    )
    assert scan_res.status_code == 200
    scan_id = scan_res.json()["id"]

    # User A can access scan
    get_a = client.get(f"/api/v1/scans/{scan_id}", headers=headers_a)
    assert get_a.status_code == 200

    # User B CANNOT access User A's scan (Cross-user isolation verified)
    get_b = client.get(f"/api/v1/scans/{scan_id}", headers=headers_b)
    assert get_b.status_code == 404

    # Report downloads for User A
    pdf_res = client.get(f"/api/v1/scans/{scan_id}/report.pdf", headers=headers_a)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"

    json_res = client.get(f"/api/v1/scans/{scan_id}/report.json", headers=headers_a)
    assert json_res.status_code == 200
    assert "investigation" in json_res.json()

def test_threat_intelligence_endpoints():
    res = client.get("/api/v1/threats/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_threats" in data
    assert "DEMO DATA" in data["provenance_note"]

    geo_res = client.get("/api/v1/threats/geo-summary")
    assert geo_res.status_code == 200
    assert len(geo_res.json()) > 0

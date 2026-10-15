from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.entities import ThreatIncident

INITIAL_THREAT_DATA = [
    # Maharashtra (MH)
    {"category": "Digital arrest scams", "state_code": "MH", "incident_count": 42, "details": "Impersonation of Mumbai Police & CBI alleging narcotics parcels to Cambodia/Thailand."},
    {"category": "UPI/payment fraud", "state_code": "MH", "incident_count": 89, "details": "Fake electricity bill payment links requiring immediate APK installation."},
    {"category": "Investment scams", "state_code": "MH", "incident_count": 64, "details": "Fraudulent stock trading group promises 300% weekly return on institutional IPO allocations."},
    {"category": "Suspected deepfake-enabled fraud", "state_code": "MH", "incident_count": 18, "details": "AI audio cloned voice of corporate executive requesting urgent vendor wire transfer."},

    # Delhi (DL)
    {"category": "Digital arrest scams", "state_code": "DL", "incident_count": 55, "details": "Bogus Supreme Court/Customs video calls demanding security clearance bonds via RTGS."},
    {"category": "Phishing", "state_code": "DL", "incident_count": 72, "details": "Deceptive income tax refund portal harvesting banking netbanking credentials and PAN."},
    {"category": "Impersonation", "state_code": "DL", "incident_count": 41, "details": "Fake TRAI disconnection warnings prompting victim to press 9 for remote assistance."},

    # Karnataka (KA)
    {"category": "Investment scams", "state_code": "KA", "incident_count": 78, "details": "Part-time task fraud promising 5,000 INR per day for hotel and video reviews via Telegram."},
    {"category": "UPI/payment fraud", "state_code": "KA", "incident_count": 53, "details": "Collect request QR code scam on secondhand marketplace listings."},
    {"category": "Suspected deepfake-enabled fraud", "state_code": "KA", "incident_count": 22, "details": "Face-swapped video call spoofing family member in emergency medical distress."},

    # Tamil Nadu (TN)
    {"category": "Phishing", "state_code": "TN", "incident_count": 47, "details": "Fraudulent courier tracking SMS asking for 5 INR redelivery fee to capture CVV."},
    {"category": "Identity theft", "state_code": "TN", "incident_count": 31, "details": "Unauthorized SIM-swap targeting Aadhaar-linked phone numbers."},

    # Uttar Pradesh (UP)
    {"category": "Digital arrest scams", "state_code": "UP", "incident_count": 61, "details": "False police FIR summons sent over WhatsApp threatening imminent doorstep arrest."},
    {"category": "UPI/payment fraud", "state_code": "UP", "incident_count": 94, "details": "Fake lottery and government subsidy portal capturing UPI PIN."},

    # Gujarat (GJ)
    {"category": "Investment scams", "state_code": "GJ", "incident_count": 69, "details": "Fake commodity trading app mimicking MCX exchange rates with locked withdrawals."},
    {"category": "Impersonation", "state_code": "GJ", "incident_count": 38, "details": "Bank manager impersonation requesting credit card reward point redemption."}
]

STATE_COORDINATES = {
    "MH": {"name": "Maharashtra", "lat": 19.7515, "lng": 75.7139},
    "DL": {"name": "Delhi NCR", "lat": 28.6139, "lng": 77.2090},
    "KA": {"name": "Karnataka", "lat": 15.3173, "lng": 75.7139},
    "TN": {"name": "Tamil Nadu", "lat": 11.1271, "lng": 78.6569},
    "UP": {"name": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    "GJ": {"name": "Gujarat", "lat": 22.2587, "lng": 71.1924}
}

def seed_threat_database():
    db = SessionLocal()
    try:
        count = db.query(ThreatIncident).count()
        if count == 0:
            for item in INITIAL_THREAT_DATA:
                incident = ThreatIncident(
                    category=item["category"],
                    state_code=item["state_code"],
                    geographic_resolution="state",
                    reported_at=datetime.utcnow() - timedelta(days=2),
                    source_type="demo",
                    verification_status="simulated_threat_research",
                    source_reference="SYNVEX Threat Intelligence Lab Demonstration Corpus",
                    is_demo=True,
                    incident_count=item["incident_count"],
                    details=item["details"]
                )
                db.add(incident)
            db.commit()
    finally:
        db.close()

import re
from typing import Dict, Any, List

SUSPICIOUS_PATTERNS = {
    "DIGITAL_ARREST_IMPERSONATION": [
        r'\b(?:digital\s+arrest|cbi|ed\s+directorate|cyber\s+crime\s+branch|customs\s+department|supreme\s+court|delhi\s+police|mumbai\s+police|trai\s+notice)\b',
        r'\b(?:illegal\s+parcel|drugs\s+found|narcotics\s+consignment|passport\s+blocked|aadhaar\s+suspended)\b'
    ],
    "URGENT_FINANCIAL_COERCION": [
        r'\b(?:pay\s+immediately|send\s+money\s+now|penalty\s+within\s+\d+\s+(?:hour|minute)|immediate\s+transfer|clear\s+dues\s+urgently)\b',
        r'\b(?:fine\s+amount|security\s+deposit|verification\s+fee|refundable\s+amount)\b'
    ],
    "CREDENTIAL_AND_OTP_THEFT": [
        r'\b(?:share\s+(?:your\s+|the\s+)?otp|send\s+the\s+code|verify\s+your\s+password|enter\s+pin|provide\s+cvv|netbanking\s+credentials|kyc\s+update\s+link)\b',
        r'\b(?:pan\s+card\s+number|aadhaar\s+otp|bank\s+verification\s+code)\b'
    ],
    "REMOTE_ACCESS_EXPLOITATION": [
        r'\b(?:anydesk|teamviewer|rustdesk|quicksupport|ultraviewer|screen\s+share\s+app|remote\s+support\s+app)\b',
        r'\b(?:install\s+this\s+apk|download\s+support\s+file|grant\s+accessibility\s+permission)\b'
    ],
    "PONZI_AND_TASK_FRAUD": [
        r'\b(?:guaranteed\s+(?:return|profit)|double\s+your\s+money|part-time\s+job\s+earn\s+\d+|like\s+youtube\s+videos\s+and\s+earn|crypto\s+investment\s+scheme)\b',
        r'\b(?:telegram\s+group\s+for\s+task|vip\s+level|withdrawal\s+tax)\b'
    ]
}

SUSPICIOUS_TLDS = [".xyz", ".top", ".buzz", ".work", ".click", ".link", ".ru", ".cn", ".cfd", ".monster"]

def analyze_text_content(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        return {
            "has_content": False,
            "indicators": [],
            "extracted_urls": [],
            "risk_score_contribution": 0.0
        }

    lower_text = text.lower()
    detected_indicators = []
    total_contribution = 0.0

    for category, regex_list in SUSPICIOUS_PATTERNS.items():
        matched_terms = []
        for reg in regex_list:
            matches = re.findall(reg, lower_text, re.IGNORECASE)
            if matches:
                matched_terms.extend(list(set(matches)))
        
        if matched_terms:
            severity = "HIGH" if category in ["DIGITAL_ARREST_IMPERSONATION", "CREDENTIAL_AND_OTP_THEFT", "REMOTE_ACCESS_EXPLOITATION"] else "MEDIUM"
            weight = 25.0 if severity == "HIGH" else 15.0
            total_contribution += weight
            detected_indicators.append({
                "category": category,
                "severity": severity,
                "matches": matched_terms[:5],
                "contribution": weight,
                "summary": f"Detected {category.replace('_', ' ').title()} indicators: {', '.join(matched_terms[:3])}"
            })

    # Scan for URLs & URL shorteners
    url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
    urls = list(set(url_pattern.findall(text)))
    suspicious_urls = []
    for u in urls:
        u_lower = u.lower()
        if any(tld in u_lower for tld in SUSPICIOUS_TLDS) or any(short in u_lower for short in ["bit.ly", "tinyurl.com", "t.me", "wa.me"]):
            suspicious_urls.append(u)

    if suspicious_urls:
        total_contribution += 20.0
        detected_indicators.append({
            "category": "SUSPICIOUS_URLS",
            "severity": "HIGH",
            "matches": suspicious_urls[:5],
            "contribution": 20.0,
            "summary": f"Contains suspicious or shortened URLs: {', '.join(suspicious_urls[:3])}"
        })

    # Normalized score contribution capped at 95
    final_score = min(total_contribution, 95.0)

    return {
        "has_content": True,
        "char_count": len(text),
        "word_count": len(text.split()),
        "indicators": detected_indicators,
        "indicator_count": len(detected_indicators),
        "extracted_urls": urls[:20],
        "suspicious_urls": suspicious_urls,
        "risk_score_contribution": final_score
    }

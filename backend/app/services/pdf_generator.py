import io
from datetime import datetime
from typing import Dict, Any

def generate_pdf_report(investigation_data: Dict[str, Any]) -> bytes:
    """
    Generates a valid, compliant PDF-1.4 document from investigation records.
    """
    inv_id = str(investigation_data.get("id", "N/A"))
    filename = str(investigation_data.get("original_filename", "N/A"))
    sha256 = str(investigation_data.get("file_sha256", "N/A"))
    risk_level = str(investigation_data.get("risk_level", "Unknown"))
    risk_score = str(investigation_data.get("risk_score", "0.0"))
    input_type = str(investigation_data.get("input_type", "N/A")).upper()
    created_at = str(investigation_data.get("created_at", "N/A"))

    lines = [
        "SYNVEX FORENSIC INVESTIGATION REPORT",
        "--------------------------------------------------",
        f"Investigation ID : {inv_id}",
        f"Generated At     : {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        f"Target Filename  : {filename}",
        f"Category / Type  : {input_type}",
        f"Cryptographic SHA: {sha256}",
        "--------------------------------------------------",
        f"RISK ASSESSMENT  : {risk_level.upper()}",
        f"COMPOSITE SCORE  : {risk_score} / 100",
        f"SCORING METHOD   : {investigation_data.get('scoring_method', 'SYNVEX_DETERMINISTIC_V1.4')}",
        "--------------------------------------------------",
        "VERIFIED FINDINGS:"
    ]

    findings = investigation_data.get("findings", [])
    if not findings:
        lines.append("  * No significant risk indicators detected.")
    else:
        for idx, f in enumerate(findings[:12], 1):
            title = f.get("title", "")
            sev = f.get("severity", "LOW")
            contrib = f.get("contribution_value", 0.0)
            lines.append(f"  {idx}. [{sev}] {title} (+{contrib} pts)")
            desc = f.get("description", "")
            if desc:
                # Wrap long text
                words = desc.split()
                chunk = "     "
                for w in words:
                    if len(chunk) + len(w) > 75:
                        lines.append(chunk)
                        chunk = "     " + w + " "
                    else:
                        chunk += w + " "
                if chunk.strip():
                    lines.append(chunk)

    lines.extend([
        "--------------------------------------------------",
        "EXECUTED ENGINES & PRETRAINED MODELS:"
    ])

    for run in investigation_data.get("analysis_runs", []):
        m_name = run.get("analyzer_name", "")
        m_ver = run.get("analyzer_version", "")
        m_stat = run.get("status", "")
        lines.append(f"  - {m_name} (v{m_ver}): {m_stat}")

    lines.extend([
        "--------------------------------------------------",
        "DISCLAIMER & RESPONSIBLE USE:",
        "This dossier was generated for cyber-forensics triage and validation.",
        "Scoring values reflect deterministic rule and neural feature indicators.",
        "SYNVEX - UNMASK THE SIGNAL. EXPOSE THE EVIDENCE."
    ])

    # Construct standard PDF 1.4 stream
    content_stream = "BT\n/F1 9 Tf\n20 770 Td\n13 TL\n"
    for line in lines:
        clean_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        content_stream += f"({clean_line}) '\n"
    content_stream += "ET\n"

    stream_bytes = content_stream.encode('latin1')
    stream_len = len(stream_bytes)

    objects = []
    # Obj 1: Catalog
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # Obj 2: Pages
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # Obj 3: Page
    objects.append(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
    # Obj 4: Stream
    objects.append(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode('latin1') + stream_bytes + b"\nendstream\nendobj\n")
    # Obj 5: Font
    objects.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n")

    # Header
    pdf_out = io.BytesIO()
    pdf_out.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    
    offsets = []
    for obj in objects:
        offsets.append(pdf_out.tell())
        pdf_out.write(obj)

    xref_pos = pdf_out.tell()
    pdf_out.write(b"xref\n0 6\n0000000000 65535 f \n")
    for off in offsets:
        pdf_out.write(f"{off:010d} 00000 n \n".encode('latin1'))

    pdf_out.write(f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode('latin1'))
    return pdf_out.getvalue()

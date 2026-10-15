import html
import json
from datetime import datetime
from typing import Dict, Any

def generate_json_report(investigation_data: Dict[str, Any]) -> str:
    """
    Generates a structured forensic JSON report.
    """
    report_dict = {
        "report_metadata": {
            "platform": "SYNVEX Cyber-Forensics Platform",
            "tagline": "Unmask the Signal. Expose the Evidence.",
            "report_version": "1.0",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "scoring_method": investigation_data.get("scoring_method", "SYNVEX_DETERMINISTIC_V1.4")
        },
        "investigation": {
            "id": investigation_data.get("id"),
            "original_filename": investigation_data.get("original_filename"),
            "file_sha256": investigation_data.get("file_sha256"),
            "input_type": investigation_data.get("input_type"),
            "status": investigation_data.get("status"),
            "risk_level": investigation_data.get("risk_level"),
            "risk_score": investigation_data.get("risk_score"),
            "created_at": str(investigation_data.get("created_at")),
            "completed_at": str(investigation_data.get("completed_at"))
        },
        "executed_methods": [
            {
                "name": run.get("analyzer_name"),
                "version": run.get("analyzer_version"),
                "status": run.get("status"),
                "started_at": str(run.get("started_at")),
                "completed_at": str(run.get("completed_at"))
            }
            for run in investigation_data.get("analysis_runs", [])
        ],
        "findings": [
            {
                "title": f.get("title"),
                "finding_type": f.get("finding_type"),
                "severity": f.get("severity"),
                "contribution_value": f.get("contribution_value"),
                "description": f.get("description"),
                "evidence": f.get("evidence_json", {})
            }
            for f in investigation_data.get("findings", [])
        ],
        "disclaimer": "This report is generated for cyber-forensic investigation and educational verification. Indicator scores are deterministic calculations based on observed forensic signatures and neural classification outputs."
    }
    return json.dumps(report_dict, indent=2)

def generate_html_report(investigation_data: Dict[str, Any]) -> str:
    """
    Generates an executive-grade printable HTML forensic report dossier with black-and-gold SYNVEX styling.
    """
    inv_id = html.escape(str(investigation_data.get("id", "N/A")))
    filename = html.escape(str(investigation_data.get("original_filename", "N/A")))
    sha256 = html.escape(str(investigation_data.get("file_sha256", "N/A")))
    risk_level = html.escape(str(investigation_data.get("risk_level", "Unknown")))
    risk_score = float(investigation_data.get("risk_score", 0.0))
    input_type = html.escape(str(investigation_data.get("input_type", "N/A")).upper())
    created_at = html.escape(str(investigation_data.get("created_at", "N/A")))

    risk_badge_color = "#EF4444" if "Elevated" in risk_level else "#F59E0B" if "Some" in risk_level else "#10B981"

    findings_html = ""
    for f in investigation_data.get("findings", []):
        f_title = html.escape(f.get("title", ""))
        f_type = html.escape(f.get("finding_type", ""))
        f_desc = html.escape(f.get("description", ""))
        f_sev = html.escape(f.get("severity", "LOW"))
        f_contrib = f.get("contribution_value", 0.0)
        
        ev_json = f.get("evidence_json") or {}
        analysis_method = html.escape(str(ev_json.get("analysis_method", "N/A")))
        why_it_matters = html.escape(str(ev_json.get("why_it_matters", "N/A")))
        benign_expl = html.escape(str(ev_json.get("possible_benign_explanations", "N/A")))
        limitations = html.escape(str(ev_json.get("known_limitations", "N/A")))

        findings_html += f"""
        <div class="finding-card">
          <div class="finding-header">
            <span class="finding-title">{f_title}</span>
            <span class="severity-badge sev-{f_sev.lower()}">{f_sev} (+{f_contrib} pts)</span>
          </div>
          <div class="finding-type">Category: {f_type} | Method: {analysis_method}</div>
          <p class="finding-desc">{f_desc}</p>
          <div class="explainability-box">
            <strong>Why it matters:</strong> {why_it_matters}<br/>
            <strong>Benign explanation:</strong> {benign_expl}<br/>
            <strong>Limitations:</strong> {limitations}
          </div>
        </div>
        """

    methods_html = ""
    for run in investigation_data.get("analysis_runs", []):
        m_name = html.escape(run.get("analyzer_name", ""))
        m_ver = html.escape(run.get("analyzer_version", ""))
        m_stat = html.escape(run.get("status", ""))
        methods_html += f"<li><strong>{m_name}</strong> (v{m_ver}) — <span class='status-{m_stat.lower()}'>{m_stat}</span></li>"

    html_template = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SYNVEX Forensic Dossier - {inv_id}</title>
  <style>
    @page {{ size: A4; margin: 15mm; }}
    body {{
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: #070707;
      color: #F5F5F5;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }}
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #D4AF62;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }}
    .brand-title {{
      font-size: 26px;
      font-weight: 800;
      color: #D4AF62;
      letter-spacing: 2px;
    }}
    .brand-sub {{
      font-size: 11px;
      color: #A7A7A7;
      letter-spacing: 1px;
    }}
    .meta-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #111111;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid rgba(212, 175, 98, 0.2);
      margin-bottom: 24px;
    }}
    .meta-item {{ font-size: 13px; }}
    .meta-label {{ color: #A7A7A7; font-weight: 600; text-transform: uppercase; font-size: 11px; }}
    .meta-value {{ color: #F5F5F5; font-family: monospace; word-break: break-all; }}
    .risk-banner {{
      background: #171717;
      border-left: 6px solid {risk_badge_color};
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .risk-title {{ font-size: 18px; font-weight: bold; color: {risk_badge_color}; }}
    .risk-score {{ font-size: 24px; font-weight: 900; color: #D4AF62; }}
    .section-title {{
      font-size: 16px;
      color: #F4D995;
      border-bottom: 1px solid rgba(212, 175, 98, 0.2);
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }}
    .finding-card {{
      background: #111111;
      border: 1px solid rgba(212, 175, 98, 0.15);
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 12px;
    }}
    .finding-header {{ display: flex; justify-content: space-between; align-items: center; }}
    .finding-title {{ font-size: 14px; font-weight: bold; color: #F5F5F5; }}
    .severity-badge {{
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: bold;
      text-transform: uppercase;
    }}
    .sev-critical {{ background: #EF4444; color: white; }}
    .sev-high {{ background: #DC2626; color: white; }}
    .sev-medium {{ background: #F59E0B; color: black; }}
    .sev-low {{ background: #10B981; color: white; }}
    .sev-info {{ background: #3B82F6; color: white; }}
    .finding-type {{ font-size: 11px; color: #8C7139; margin-top: 4px; }}
    .finding-desc {{ font-size: 12px; color: #D1D5DB; margin: 8px 0; }}
    .explainability-box {{
      background: #070707;
      padding: 10px;
      border-radius: 4px;
      font-size: 11px;
      color: #A7A7A7;
      border-left: 2px solid #8C7139;
    }}
    .disclaimer {{
      font-size: 10px;
      color: #727272;
      border-top: 1px solid rgba(212, 175, 98, 0.2);
      padding-top: 12px;
      margin-top: 30px;
      text-align: center;
    }}
    @media print {{
      body {{ background: white !important; color: black !important; }}
      .header {{ border-bottom-color: black; }}
      .brand-title {{ color: black; }}
      .meta-grid, .finding-card, .risk-banner {{ background: #f9f9f9 !important; border-color: #ddd !important; color: black !important; }}
      .meta-value, .finding-title, .finding-desc {{ color: black !important; }}
      .explainability-box {{ background: #eee !important; color: #333 !important; }}
      .btn-print {{ display: none; }}
    }}
    .btn-print {{
      background: #D4AF62;
      color: black;
      border: none;
      padding: 8px 18px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
    }}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">SYNVEX</div>
      <div class="brand-sub">AI CYBER-FORENSICS & DIGITAL IDENTITY INTELLIGENCE</div>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">Print Dossier</button>
    </div>
  </div>

  <div class="risk-banner">
    <div>
      <div class="risk-title">{risk_level}</div>
      <div style="font-size: 12px; color: #A7A7A7;">Scoring Model: {investigation_data.get('scoring_method')}</div>
    </div>
    <div class="risk-score">
      {risk_score} <span style="font-size: 14px; color: #A7A7A7;">/ 100</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Investigation ID</div>
      <div class="meta-value">{inv_id}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">File Type / Category</div>
      <div class="meta-value">{input_type}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Original Filename</div>
      <div class="meta-value">{filename}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Timestamp (UTC)</div>
      <div class="meta-value">{created_at}</div>
    </div>
    <div class="meta-item" style="grid-column: span 2;">
      <div class="meta-label">Cryptographic SHA-256 Digest</div>
      <div class="meta-value">{sha256}</div>
    </div>
  </div>

  <div class="section-title">Verified Forensic Findings ({len(investigation_data.get('findings', []))})</div>
  {findings_html if findings_html else '<p style="color:#A7A7A7; font-size:13px;">No anomaly indicators detected above baseline threshold.</p>'}

  <div class="section-title">Executed Forensic Engines</div>
  <ul style="font-size: 12px; color: #D1D5DB; line-height: 1.8;">
    {methods_html}
  </ul>

  <div class="disclaimer">
    <strong>OFFICIAL SYNVEX FORENSIC DOSSIER</strong><br/>
    Unmask the Signal. Expose the Evidence. Generated dynamically from persisted cryptographic state.
    Findings and machine learning outputs are intended for technical evaluation and evidence-backed triage.
  </div>
</body>
</html>"""
    return html_template

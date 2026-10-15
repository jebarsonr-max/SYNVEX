# SYNVEX Risk Engine & Deterministic Scoring Methodology

## Scoring Version: `SYNVEX_DETERMINISTIC_V1.4`

### Principles
1. **Deterministic & Verifiable**: Given the same input content and forensic findings, the engine always yields the identical score.
2. **Transparent Contribution**: Each finding specifies an explicit point contribution.
3. **Diminishing Returns**: Duplicate finding categories are discounted to prevent synthetic score inflation.
4. **Honest Limitations**: The score indicates the presence and severity of forensic warning indicators. It does not represent the judicial probability that a crime occurred.

### Categorical Risk Tiers
- **Elevated Risk** (`Score >= 70.0` or any `CRITICAL` severity finding):
  Severe indicators detected, such as embedded PDF JavaScript, executable VBA macros in DOCX, or strong deepfake generative spectral roll-offs.
- **Some Indicators Found** (`Score >= 35.0` and `< 70.0`):
  Noticeable anomalies present, such as high ELA compression variance, suspicious software signatures, or urgent coercion terminology.
- **No Significant Indicators Detected** (`Score < 35.0` with low/zero anomaly count):
  Content exhibits standard optical Bayer sensor properties, natural text distribution, and clean container structures.
- **Inconclusive / Analysis Unavailable**:
  Corrupted inputs or unparseable formats.

### Severity Weights
- `CRITICAL`: +50.0 pts (e.g. VBA macro malware, JavaScript injection)
- `HIGH`: +25.0 to +35.0 pts (e.g. Digital arrest impersonation, calibrated deepfake probability >0.7)
- `MEDIUM`: +15.0 to +20.0 pts (e.g. ELA variance, financial urgency phrases)
- `LOW / INFO`: +0.0 to +10.0 pts (e.g. Missing camera EXIF, normal optical noise)

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  display_name: string;
}

export interface Finding {
  id: string;
  finding_type: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  contribution_value: number;
  evidence_json?: {
    observed_evidence?: any;
    analysis_method?: string;
    why_it_matters?: string;
    possible_benign_explanations?: string;
    known_limitations?: string;
  };
  created_at: string;
}

export interface AnalysisRun {
  id: string;
  analyzer_name: string;
  analyzer_version: string;
  status: 'COMPLETED' | 'FAILED' | 'UNAVAILABLE';
  configuration_json?: any;
  output_json?: any;
  started_at: string;
  completed_at?: string;
}

export interface Investigation {
  id: string;
  input_type: 'image' | 'document' | 'audio' | 'text' | string;
  original_filename: string;
  file_sha256: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  risk_level: 'Elevated Risk' | 'Some Indicators Found' | 'No Significant Indicators Detected' | 'Inconclusive' | 'Analysis Unavailable';
  risk_score: number;
  scoring_method: string;
  created_at: string;
  completed_at?: string;
  findings?: Finding[];
  analysis_runs?: AnalysisRun[];
}

export interface DashboardSummary {
  total_investigations: number;
  completed_investigations: number;
  elevated_risk_count: number;
  reports_generated: number;
  average_risk_score: number;
  active_analyzers_count: number;
}

export interface DashboardTrends {
  risk_distribution: Record<string, number>;
  activity_timeline: { date: string; investigations: number; elevated_risks: number }[];
  category_distribution: Record<string, number>;
}

export interface ThreatIncident {
  id: string;
  category: string;
  state_code: string;
  geographic_resolution: string;
  reported_at: string;
  source_type: string;
  verification_status: string;
  is_demo: boolean;
  incident_count: number;
  details?: string;
}

export interface ThreatGeoSummary {
  state_code: string;
  state_name: string;
  total_incidents: number;
  primary_category: string;
  high_risk_count: number;
  is_demo: boolean;
}

export interface ThreatSummary {
  total_threats: number;
  top_category: string;
  state_count: number;
  categories: Record<string, number>;
  provenance_note: string;
}

export interface ModelStatus {
  model_name: string;
  framework: string;
  task: string;
  readiness: string;
  weights_status: string;
  device: string;
}

// =========================================================================
// INNOVATIVE FORENSIC FEATURES INTERFACES
// =========================================================================

export interface CustodyLog {
  id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  timestamp: string;
  action_details?: any;
  hash_at_action: string;
  tamper_check_result: string;
}

export interface EvidenceItem {
  id: string;
  investigation_id: string;
  evidence_number: string;
  original_filename?: string;
  file_sha256: string;
  file_size_bytes: number;
  mime_type: string;
  integrity_status: string;
  ingested_at: string;
  last_verified_at: string;
  metadata_json?: any;
  custody_logs: CustodyLog[];
}

export interface CustodyVerification {
  evidence_number: string;
  file_sha256: string;
  status: 'MATCH_VERIFIED' | 'INTEGRITY_COMPROMISED' | string;
  verified_at: string;
  audit_event_id: string;
  message: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'target' | 'finding' | 'analyzer' | 'entity' | 'threat_category' | string;
  category?: string;
  severity?: string;
  score_contribution?: number;
  details?: any;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relation_type: 'verified_finding' | 'analyzed_by' | 'detected_entity' | 'associated_threat' | 'cross_correlated' | string;
  is_verified: boolean;
  weight: number;
}

export interface EvidenceGraph {
  investigation_id?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  total_nodes: number;
  total_edges: number;
}

export interface CopilotCitation {
  finding_id?: string;
  title: string;
  severity: string;
  analyzer: string;
  reference_data?: any;
}

export interface CopilotQueryResponse {
  question: string;
  answer: string;
  citations: CopilotCitation[];
  confidence_assessment: {
    evidence_sufficiency: 'HIGH' | 'MEDIUM' | 'LOW' | string;
    case_boundary_enforced: boolean;
    zero_hallucinations_verified: boolean;
    limitations_noted: string[];
  };
  suggested_followups: string[];
  llm_source: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event_type: 'CAPTURE_OBSERVED' | 'INGESTION_OBSERVED' | 'ANALYSIS_EXECUTION' | 'FINDING_DETECTED' | 'AUDIT_ACTION' | string;
  is_observed: boolean;
  source: string;
  summary: string;
  severity?: string;
  details?: any;
  anomaly_detected?: string;
}

export interface TimelineReconstruction {
  investigation_id: string;
  canonical_timezone: string;
  events: TimelineEvent[];
  total_events: number;
  observed_events_count: number;
  inferred_events_count: number;
  anomalies_detected: string[];
}

export interface CorrelationMatch {
  target_investigation_id: string;
  target_filename: string;
  match_type: 'EXACT_HASH_MATCH' | 'SHARED_ENTITY' | 'SHARED_THREAT_PATTERN' | string;
  attribute_name: string;
  attribute_value: string;
  confidence: number;
  explanation: string;
}

export interface InvestigationCorrelation {
  investigation_id: string;
  correlations: CorrelationMatch[];
  total_matches: number;
}

export interface InvestigationComparison {
  scan_a: {
    id: string;
    filename: string;
    sha256: string;
    input_type: string;
    risk_score: number;
    risk_level: string;
    created_at: string;
  };
  scan_b: {
    id: string;
    filename: string;
    sha256: string;
    input_type: string;
    risk_score: number;
    risk_level: string;
    created_at: string;
  };
  score_delta: number;
  risk_level_transition: string;
  findings_delta: {
    shared_count: number;
    unique_to_a_count: number;
    unique_to_b_count: number;
    shared_findings: { title: string; severity: string; score_a: number; score_b: number }[];
    unique_to_a: { title: string; severity: string; contribution: number }[];
    unique_to_b: { title: string; severity: string; contribution: number }[];
  };
  entities_delta: {
    shared_entities: string[];
    unique_to_a: any[];
    unique_to_b: any[];
  };
  metadata_delta: {
    type_match: boolean;
    hash_identical: boolean;
    sha256_a: string;
    sha256_b: string;
  };
  model_predictions_delta: {
    cnn_comparison?: {
      model_name: string;
      prob_a: number;
      prob_b: number;
      difference_percent: number;
    };
  };
}


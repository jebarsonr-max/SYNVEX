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

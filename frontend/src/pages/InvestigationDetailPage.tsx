import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation, EvidenceGraph } from '../types';
import { EvidenceRelationshipGraph } from '../components/forensic/EvidenceRelationshipGraph';
import { ForensicCopilot } from '../components/forensic/ForensicCopilot';
import { ChainOfCustodyVault } from '../components/forensic/ChainOfCustodyVault';
import { ForensicTimeline } from '../components/forensic/ForensicTimeline';
import { CrossModalCorrelations } from '../components/forensic/CrossModalCorrelations';
import {
  ShieldAlert,
  ArrowLeft,
  Download,
  Printer,
  Trash2,
  FileCheck2,
  Cpu,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  GitCompare,
  Network,
  MessageSquare,
  Clock,
  Link2,
  Sparkles,
  Lock
} from 'lucide-react';

export const InvestigationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [graphData, setGraphData] = useState<EvidenceGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Active sub-view tab
  const [activeTab, setActiveTab] = useState<'dossier' | 'graph' | 'copilot' | 'custody' | 'timeline' | 'correlations'>('dossier');
  const [highlightedFindingId, setHighlightedFindingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.scans.getById(id),
      api.scans.getGraph(id).catch(() => null)
    ])
      .then(([invData, gData]) => {
        setInvestigation(invData);
        setGraphData(gData);
      })
      .catch(err => setError(err.message || 'Failed to load investigation details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this investigation from the evidence vault?')) return;
    setDeleting(true);
    try {
      await api.scans.delete(id);
      navigate('/console/investigations');
    } catch (err: any) {
      alert(err.message || 'Failed to delete investigation.');
      setDeleting(false);
    }
  };

  const handleSelectFinding = (findingId: string) => {
    setActiveTab('dossier');
    setHighlightedFindingId(findingId);
    setTimeout(() => {
      const el = document.getElementById(`finding-${findingId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gold-champagne font-mono text-sm">
        Retrieving cryptographic dossier from vault...
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="p-8 bg-surface-card border border-red-800 rounded-xl text-center space-y-4">
        <p className="text-red-400 font-bold">{error || 'Investigation record not found.'}</p>
        <Link to="/console/investigations" className="inline-block px-4 py-2 rounded bg-surface-elevated border border-gold-border text-xs text-gold-champagne">
          Return to Evidence Vault
        </Link>
      </div>
    );
  }

  const riskBadgeColor =
    investigation.risk_level === 'Elevated Risk' ? 'text-red-400 bg-red-950 border-red-800' :
    investigation.risk_level === 'Some Indicators Found' ? 'text-amber-400 bg-amber-950 border-amber-800' :
    'text-emerald-400 bg-emerald-950 border-emerald-800';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-border/40">
        <Link
          to="/console/investigations"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-gold-champagne transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Investigation History</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Comparison Lab Jump Button */}
          <Link
            to={`/console/compare?a=${investigation.id}`}
            className="px-3 py-1.5 rounded bg-surface-card border border-gold-border text-xs font-semibold text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1.5 shadow-sm"
          >
            <GitCompare className="w-3.5 h-3.5 text-gold-primary" />
            <span>Compare in Lab</span>
          </Link>

          <a
            href={api.scans.getReportPdfUrl(investigation.id)}
            download
            className="px-3 py-1.5 rounded bg-surface-card border border-gold-border text-xs font-semibold text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>

          <a
            href={api.scans.getReportJsonUrl(investigation.id)}
            download
            className="px-3 py-1.5 rounded bg-surface-card border border-gold-border text-xs font-semibold text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </a>

          <a
            href={api.scans.getReportHtmlUrl(investigation.id)}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded bg-surface-card border border-gold-border text-xs font-semibold text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </a>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded bg-red-950/40 border border-red-800 text-xs text-red-400 hover:bg-red-950 transition-all flex items-center gap-1.5 ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Target Metadata Banner */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gold-primary/10 border border-gold-border text-gold-primary uppercase">
              {investigation.input_type} ANALYSIS
            </span>
            <span className="text-xs text-text-muted">
              Logged {new Date(investigation.created_at).toLocaleString()}
            </span>
          </div>

          <h2 className="text-2xl font-black text-text-main">
            {investigation.original_filename || 'Analysis Input'}
          </h2>

          <div className="p-2.5 rounded bg-surface-elevated border border-gold-border/30 font-mono text-[11px] text-text-secondary break-all">
            <span className="text-gold-primary font-bold">SHA-256:</span> {investigation.file_sha256}
          </div>
        </div>

        {/* Risk Score Gauge */}
        <div className="md:col-span-4 p-5 rounded-xl bg-surface-elevated border border-gold-border/60 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">COMPOSITE RISK RATING</span>
          <div className="text-4xl font-black text-gold-champagne mt-1">
            {investigation.risk_score} <span className="text-sm text-text-muted">/ 100</span>
          </div>
          <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-bold border ${riskBadgeColor}`}>
            {investigation.risk_level}
          </span>
          <span className="text-[10px] font-mono text-text-muted mt-2">
            Method: {investigation.scoring_method}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gold-border/40 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dossier')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'dossier'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Explainable Risk & Findings ({investigation.findings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'graph'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Relationship Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'copilot'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Sparkles className="w-4 h-4 text-gold-primary" />
          <span>Forensic Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('custody')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'custody'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Evidence Vault & Custody</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('correlations')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'correlations'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Correlations</span>
        </button>
      </div>

      {/* Tab 1: Explainable AI Risk Analysis & Findings */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          {/* Explainable AI Risk Guidance & Limitations Box */}
          <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-lg space-y-3">
            <h4 className="font-bold text-sm text-text-main flex items-center gap-2">
              <Info className="w-4 h-4 text-gold-primary" />
              <span>Model Confidence vs. Malicious Intent Transparency</span>
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              SYNVEX never confuses model statistical confidence with proof of malicious activity. An image exhibiting high ELA variance may simply contain high-contrast sharp typography, while stripped EXIF metadata is standard across messaging networks (e.g. WhatsApp, Signal) for privacy preservation.
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-surface-elevated border border-gold-border/20">
                <span className="font-semibold text-gold-champagne block mb-1">Recommended Next Steps:</span>
                <ul className="list-disc list-inside text-text-secondary space-y-0.5 text-[11px]">
                  <li>Preserve uncompressed working copy in legal evidence vault</li>
                  <li>Corroborate findings with communication network headers</li>
                  <li>Inspect identified entities in the Relationship Graph</li>
                </ul>
              </div>
              <div className="p-3 rounded bg-surface-elevated border border-gold-border/20">
                <span className="font-semibold text-text-muted block mb-1">Underlying Limitations:</span>
                <ul className="list-disc list-inside text-text-secondary space-y-0.5 text-[11px]">
                  <li>Zero-shot dialect evasion may reduce NLP confidence</li>
                  <li>Multiple JPEG re-compressions can flatten structural ELA deltas</li>
                  <li>Absence of indicators does not guarantee absolute authenticity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Verified Findings List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-gold-primary" />
                <span>Verified Forensic Findings ({investigation.findings?.length || 0})</span>
              </h3>
              <span className="text-xs text-text-muted font-mono">Deterministic Contributions</span>
            </div>

            {(!investigation.findings || investigation.findings.length === 0) ? (
              <div className="p-8 rounded-xl bg-surface-card border border-gold-border/40 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-text-main">No Significant Risk Indicators Detected</p>
                <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                  Content did not trigger structural manipulation anomalies or high-probability generative artifacts above baseline threshold.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {investigation.findings.map((finding) => {
                  const ev = finding.evidence_json || {};
                  const isHighlighted = highlightedFindingId === finding.id;
                  return (
                    <div
                      key={finding.id}
                      id={`finding-${finding.id}`}
                      className={`p-5 rounded-xl bg-surface-card border transition-all space-y-3 shadow-md ${
                        isHighlighted
                          ? 'border-gold-primary ring-2 ring-gold-primary/30'
                          : 'border-gold-border/60 hover:border-gold-primary/80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            finding.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                            finding.severity === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-800' :
                            finding.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {finding.severity}
                          </span>
                          <h4 className="text-base font-bold text-text-main">{finding.title}</h4>
                        </div>

                        <span className="font-mono text-xs font-bold text-gold-champagne">
                          Score Contribution: +{finding.contribution_value} pts
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        {finding.description}
                      </p>

                      {/* 4-Pillar Explainable AI Matrix */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="p-3 rounded bg-surface-elevated border border-gold-border/20">
                          <span className="font-semibold text-gold-champagne block mb-1">Why it matters:</span>
                          <p className="text-text-secondary">{ev.why_it_matters || 'Direct correlation with established attack signatures.'}</p>
                        </div>

                        <div className="p-3 rounded bg-surface-elevated border border-gold-border/20">
                          <span className="font-semibold text-gold-champagne block mb-1">Analysis Method:</span>
                          <p className="text-text-secondary">{ev.analysis_method || 'Deterministic engine extraction'}</p>
                        </div>

                        <div className="p-3 rounded bg-surface-elevated border border-gold-border/20">
                          <span className="font-semibold text-text-muted block mb-1">Possible Benign Explanation:</span>
                          <p className="text-text-secondary">{ev.possible_benign_explanations || 'Legitimate non-malicious context may present similar attributes.'}</p>
                        </div>

                        <div className="p-3 rounded bg-surface-elevated border border-gold-border/20">
                          <span className="font-semibold text-text-muted block mb-1">Known Limitations:</span>
                          <p className="text-text-secondary">{ev.known_limitations || 'Subject to format recompression and resolution constraints.'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Executed Forensic Engines & Models */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gold-primary" />
              <span>Executed Forensic Engines & Neural Inference Runs</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investigation.analysis_runs?.map((run) => (
                <div key={run.id} className="p-4 rounded-xl bg-surface-card border border-gold-border/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gold-champagne">{run.analyzer_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {run.status}
                    </span>
                  </div>
                  <div className="text-text-muted">
                    Version: {run.analyzer_version} | Executed: {new Date(run.started_at).toLocaleTimeString()}
                  </div>
                  {run.output_json && (
                    <pre className="p-2.5 rounded bg-surface-elevated border border-gold-border/20 overflow-x-auto text-[10px] font-mono text-text-secondary max-h-36">
                      {JSON.stringify(run.output_json, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive AI Evidence Relationship Graph */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          {graphData ? (
            <EvidenceRelationshipGraph
              graphData={graphData}
              onSelectFinding={handleSelectFinding}
            />
          ) : (
            <div className="p-12 text-center text-xs text-text-muted">
              Loading relationship graph...
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Forensic AI Copilot */}
      {activeTab === 'copilot' && (
        <div className="space-y-4">
          <ForensicCopilot
            investigationId={investigation.id}
            onSelectFinding={handleSelectFinding}
          />
        </div>
      )}

      {/* Tab 4: Digital Evidence Vault & Chain of Custody */}
      {activeTab === 'custody' && (
        <div className="space-y-4">
          <ChainOfCustodyVault investigationId={investigation.id} />
        </div>
      )}

      {/* Tab 5: Forensic Timeline Reconstruction */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <ForensicTimeline investigationId={investigation.id} />
        </div>
      )}

      {/* Tab 6: Cross-Modal Evidence Correlation */}
      {activeTab === 'correlations' && (
        <div className="space-y-4">
          <CrossModalCorrelations investigationId={investigation.id} />
        </div>
      )}
    </div>
  );
};

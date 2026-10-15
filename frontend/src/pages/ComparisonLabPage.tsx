import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation, InvestigationComparison } from '../types';
import {
  GitCompare,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Layers,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink
} from 'lucide-react';

export const ComparisonLabPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [scanAId, setScanAId] = useState<string>(searchParams.get('a') || '');
  const [scanBId, setScanBId] = useState<string>(searchParams.get('b') || '');
  const [comparison, setComparison] = useState<InvestigationComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.scans.getAll()
      .then(list => {
        setInvestigations(list);
        if (list.length >= 2 && !scanAId && !scanBId) {
          setScanAId(list[0].id);
          setScanBId(list[1].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleCompare = async () => {
    if (!scanAId || !scanBId) {
      setError('Please select two distinct investigations to compare.');
      return;
    }
    if (scanAId === scanBId) {
      setError('Cannot compare an investigation with itself. Select two different dossiers.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await api.scans.compare(scanAId, scanBId);
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Comparison analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scanAId && scanBId && scanAId !== scanBId) {
      handleCompare();
    }
  }, [scanAId, scanBId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2.5">
          <GitCompare className="w-6 h-6 text-gold-primary" />
          <span>Investigation Comparison Lab</span>
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Differential analysis between two forensic targets: compare risk deltas, shared findings, model probabilities, and extracted indicators.
        </p>
      </div>

      {/* Target Selector Card */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/80 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target A Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-gold-champagne mb-1.5 font-bold">
              Baseline Target (Scan A)
            </label>
            <select
              value={scanAId}
              onChange={(e) => setScanAId(e.target.value)}
              className="w-full bg-surface-elevated border border-gold-border/60 rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-gold-primary font-medium"
            >
              <option value="">Select Investigation A...</option>
              {investigations.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.original_filename || 'Evidence'} ({inv.risk_score} pts • {inv.input_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Target B Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-gold-champagne mb-1.5 font-bold">
              Comparison Target (Scan B)
            </label>
            <select
              value={scanBId}
              onChange={(e) => setScanBId(e.target.value)}
              className="w-full bg-surface-elevated border border-gold-border/60 rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-gold-primary font-medium"
            >
              <option value="">Select Investigation B...</option>
              {investigations.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.original_filename || 'Evidence'} ({inv.risk_score} pts • {inv.input_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="p-12 text-center text-xs text-gold-champagne font-mono flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
          <span>Computing differential metrics and feature vectors...</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Side-by-Side Target Overview Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box A */}
            <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-lg space-y-3">
              <span className="text-[10px] font-mono uppercase text-text-muted">BASELINE DOSSIER A</span>
              <h3 className="text-lg font-bold text-text-main truncate">{comparison.scan_a.filename || 'Target A'}</h3>
              <div className="flex items-center justify-between pt-2 border-t border-gold-border/20">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comparison.scan_a.risk_level === 'Elevated Risk' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {comparison.scan_a.risk_level}
                </span>
                <span className="text-xl font-black text-gold-champagne font-mono">
                  {comparison.scan_a.risk_score} <span className="text-xs text-text-muted">/ 100</span>
                </span>
              </div>
            </div>

            {/* Box B */}
            <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-lg space-y-3">
              <span className="text-[10px] font-mono uppercase text-text-muted">COMPARISON DOSSIER B</span>
              <h3 className="text-lg font-bold text-text-main truncate">{comparison.scan_b.filename || 'Target B'}</h3>
              <div className="flex items-center justify-between pt-2 border-t border-gold-border/20">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comparison.scan_b.risk_level === 'Elevated Risk' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {comparison.scan_b.risk_level}
                </span>
                <span className="text-xl font-black text-gold-champagne font-mono">
                  {comparison.scan_b.risk_score} <span className="text-xs text-text-muted">/ 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* Differential Metrics Banner */}
          <div className="p-5 rounded-xl bg-surface-card border border-gold-border shadow-md grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30">
              <span className="text-[10px] font-mono uppercase text-text-muted">Risk Score Delta</span>
              <div className={`text-2xl font-black font-mono mt-1 ${comparison.score_delta > 0 ? 'text-red-400' : comparison.score_delta < 0 ? 'text-emerald-400' : 'text-gold-champagne'}`}>
                {comparison.score_delta > 0 ? `+${comparison.score_delta}` : comparison.score_delta} pts
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30">
              <span className="text-[10px] font-mono uppercase text-text-muted">Shared Evidentiary Findings</span>
              <div className="text-2xl font-black font-mono text-gold-champagne mt-1">
                {comparison.findings_delta.shared_count}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30">
              <span className="text-[10px] font-mono uppercase text-text-muted">Identical SHA-256 Digest?</span>
              <div className="text-base font-bold mt-2 text-text-main">
                {comparison.metadata_delta.hash_identical ? 'YES (Duplicate File)' : 'NO (Distinct Files)'}
              </div>
            </div>
          </div>

          {/* Findings Comparison Breakdown */}
          <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl space-y-4">
            <h4 className="font-bold text-base text-text-main">Findings Differential Matrix</h4>

            {/* Shared Findings */}
            {comparison.findings_delta.shared_findings.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-gold-primary font-bold block">
                  Shared Findings across Both Targets ({comparison.findings_delta.shared_count})
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {comparison.findings_delta.shared_findings.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30 text-xs flex items-center justify-between">
                      <span className="font-bold text-text-main">{f.title}</span>
                      <span className="font-mono text-gold-champagne">Target A: +{f.score_a} | Target B: +{f.score_b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unique to A & Unique to B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-surface-elevated border border-gold-border/20 space-y-2 text-xs">
                <span className="font-mono uppercase text-text-muted font-bold block">Unique to Target A ({comparison.findings_delta.unique_to_a_count})</span>
                {comparison.findings_delta.unique_to_a.length === 0 ? (
                  <p className="text-text-muted">None</p>
                ) : (
                  comparison.findings_delta.unique_to_a.map((f, idx) => (
                    <div key={idx} className="p-2 rounded bg-surface-card border border-gold-border/10 font-medium text-text-secondary">
                      {f.title} (+{f.contribution} pts)
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 rounded-lg bg-surface-elevated border border-gold-border/20 space-y-2 text-xs">
                <span className="font-mono uppercase text-text-muted font-bold block">Unique to Target B ({comparison.findings_delta.unique_to_b_count})</span>
                {comparison.findings_delta.unique_to_b.length === 0 ? (
                  <p className="text-text-muted">None</p>
                ) : (
                  comparison.findings_delta.unique_to_b.map((f, idx) => (
                    <div key={idx} className="p-2 rounded bg-surface-card border border-gold-border/10 font-medium text-text-secondary">
                      {f.title} (+{f.contribution} pts)
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

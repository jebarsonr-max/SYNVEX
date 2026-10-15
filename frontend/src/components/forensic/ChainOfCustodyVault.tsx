import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EvidenceItem, CustodyLog, CustodyVerification } from '../../types';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Hash,
  Download,
  RefreshCw,
  Loader2,
  FileText
} from 'lucide-react';

interface Props {
  investigationId: string;
}

export const ChainOfCustodyVault: React.FC<Props> = ({ investigationId }) => {
  const [evidence, setEvidence] = useState<EvidenceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CustodyVerification | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCustody = () => {
    setLoading(true);
    api.scans.getCustody(investigationId)
      .then(data => setEvidence(data))
      .catch(() => setEvidence(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustody();
  }, [investigationId]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.scans.verifyCustody(investigationId);
      setVerificationResult(res);
      fetchCustody(); // refresh logs
    } catch (err: any) {
      alert(err.message || 'Integrity check failed');
    } finally {
      setVerifying(false);
    }
  };

  const copyHash = () => {
    if (evidence?.file_sha256) {
      navigator.clipboard.writeText(evidence.file_sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gold-champagne font-mono flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
        <span>Retrieving digital evidence vault and chain-of-custody ledger...</span>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="p-8 rounded-xl bg-surface-card border border-gold-border/40 text-center text-xs text-text-muted">
        Unable to load chain of custody record.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Evidence Identifier & Integrity Card */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/80 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-primary/10 border border-gold-border flex items-center justify-center text-gold-champagne">
              <ShieldCheck className="w-6 h-6 text-gold-primary" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gold-primary tracking-wider">OFFICIAL EVIDENCE RECORD</span>
              <h3 className="text-xl font-black text-text-main font-mono">
                {evidence.evidence_number}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 py-2 rounded-lg bg-surface-elevated border border-gold-border text-xs font-bold text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gold-primary ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Checking Cryptographic Signature...' : 'Verify Cryptographic Integrity'}</span>
            </button>
          </div>
        </div>

        {/* Verification Status Banner */}
        {verificationResult && (
          <div className={`p-4 rounded-lg text-xs flex items-center gap-3 animate-in fade-in duration-300 ${
            verificationResult.status === 'MATCH_VERIFIED'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border border-red-800 text-red-200'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">{verificationResult.message}</p>
              <p className="text-[10px] font-mono opacity-80 mt-0.5">
                Audit Event Reference: {verificationResult.audit_event_id} • Verified: {new Date(verificationResult.verified_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30 space-y-1">
            <span className="text-text-muted text-[10px] uppercase font-mono block">Target Filename</span>
            <span className="font-bold text-text-main truncate block">{evidence.original_filename || 'Analysis Input'}</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30 space-y-1">
            <span className="text-text-muted text-[10px] uppercase font-mono block">MIME Type / Modality</span>
            <span className="font-mono text-gold-champagne block">{evidence.mime_type}</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30 space-y-1">
            <span className="text-text-muted text-[10px] uppercase font-mono block">Evidence Size</span>
            <span className="font-mono text-text-main block">
              {evidence.file_size_bytes > 0 ? `${(evidence.file_size_bytes / 1024).toFixed(1)} KB` : 'In-Memory Stream'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30 space-y-1">
            <span className="text-text-muted text-[10px] uppercase font-mono block">Integrity State</span>
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {evidence.integrity_status}
            </span>
          </div>
        </div>

        {/* SHA-256 Digest Bar */}
        <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Hash className="w-4 h-4 text-gold-primary shrink-0" />
            <span className="font-mono text-text-secondary truncate">
              <strong className="text-gold-champagne">SHA-256:</strong> {evidence.file_sha256}
            </span>
          </div>
          <button
            onClick={copyHash}
            className="px-2.5 py-1 rounded bg-surface-card border border-gold-border text-[11px] text-gold-champagne hover:border-gold-primary shrink-0 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Hash'}
          </button>
        </div>
      </div>

      {/* Append-Only Chain of Custody Audit Log */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base text-text-main flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-primary" />
              <span>Append-Only Chain of Custody Audit Ledger</span>
            </h4>
            <p className="text-xs text-text-secondary mt-0.5">
              Cryptographically timestamped actions logged across evidence lifecycle.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-elevated border border-gold-border/30 font-mono text-[10px] text-text-muted">
            {evidence.custody_logs?.length || 0} Audit Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gold-border/40 text-text-muted font-mono uppercase text-[10px]">
                <th className="pb-3">Action</th>
                <th className="pb-3">Actor / Principal</th>
                <th className="pb-3">Timestamp (UTC)</th>
                <th className="pb-3">Hash at Event</th>
                <th className="pb-3">Tamper Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/20">
              {evidence.custody_logs?.map((log) => (
                <tr key={log.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-gold-champagne font-mono uppercase text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-text-main font-medium">
                    <div>{log.actor_name}</div>
                    <div className="text-[10px] font-mono text-text-muted">{log.actor_email}</div>
                  </td>
                  <td className="py-3 font-mono text-text-muted text-[11px]">
                    {new Date(log.timestamp).toUTCString()}
                  </td>
                  <td className="py-3 font-mono text-[10px] text-text-secondary truncate max-w-[140px]">
                    {log.hash_at_action}
                  </td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.tamper_check_result === 'PASSED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {log.tamper_check_result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

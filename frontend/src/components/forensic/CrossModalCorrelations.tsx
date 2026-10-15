import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { InvestigationCorrelation, CorrelationMatch } from '../../types';
import {
  Link2,
  ExternalLink,
  ShieldAlert,
  Hash,
  Globe2,
  Phone,
  CreditCard,
  Layers,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface Props {
  investigationId: string;
}

export const CrossModalCorrelations: React.FC<Props> = ({ investigationId }) => {
  const [data, setData] = useState<InvestigationCorrelation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.scans.getCorrelations(investigationId)
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [investigationId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gold-champagne font-mono flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
        <span>Scanning case archive for cross-modal correlations...</span>
      </div>
    );
  }

  const correlations = data?.correlations || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-text-main flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gold-primary" />
            <span>Cross-Modal Evidence Correlation</span>
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Cryptographic hashes, communication identifiers, and threat signatures shared with other dossiers.
          </p>
        </div>

        <span className="px-3 py-1 rounded bg-surface-elevated border border-gold-border/40 font-mono text-xs font-bold text-gold-champagne">
          {correlations.length} Correlated Association(s)
        </span>
      </div>

      {/* Correlation Cards */}
      {correlations.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface-card border border-gold-border/40 text-center text-xs text-text-muted space-y-2">
          <Layers className="w-8 h-8 text-gold-muted mx-auto opacity-50" />
          <p className="font-bold text-text-main">No Cross-Case Overlap Detected</p>
          <p className="max-w-md mx-auto text-text-secondary">
            This evidence item contains isolated identifiers with no common hashes or entities in your current case archive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlations.map((corr, idx) => {
            const isHash = corr.match_type === 'EXACT_HASH_MATCH';
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-surface-card border border-gold-border/60 hover:border-gold-primary transition-all space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isHash ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-gold-primary/10 text-gold-champagne border border-gold-border'
                    }`}>
                      {corr.match_type.replace(/_/g, ' ')}
                    </span>
                    <h4 className="font-bold text-sm text-text-main mt-1.5 truncate max-w-[220px]">
                      {corr.target_filename}
                    </h4>
                  </div>

                  <span className="text-[10px] font-mono text-text-muted">
                    Confidence: <strong>{Math.round(corr.confidence * 100)}%</strong>
                  </span>
                </div>

                <div className="p-2.5 rounded bg-surface-elevated border border-gold-border/20 text-xs space-y-1">
                  <div className="text-[11px] text-text-muted font-mono">{corr.attribute_name}</div>
                  <div className="font-mono text-gold-champagne font-bold truncate">{corr.attribute_value}</div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {corr.explanation}
                </p>

                <div className="pt-2 border-t border-gold-border/20 flex justify-end">
                  <Link
                    to={`/console/investigations/${corr.target_investigation_id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-gold-champagne hover:underline font-semibold"
                  >
                    <span>View Connected Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

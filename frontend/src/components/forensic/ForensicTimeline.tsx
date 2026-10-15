import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TimelineReconstruction, TimelineEvent } from '../../types';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  Loader2,
  FileCheck2,
  Cpu,
  Layers
} from 'lucide-react';

interface Props {
  investigationId: string;
}

export const ForensicTimeline: React.FC<Props> = ({ investigationId }) => {
  const [timeline, setTimeline] = useState<TimelineReconstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'OBSERVED' | 'INFERRED'>('ALL');

  useEffect(() => {
    setLoading(true);
    api.scans.getTimeline(investigationId)
      .then(data => setTimeline(data))
      .catch(() => setTimeline(null))
      .finally(() => setLoading(false));
  }, [investigationId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gold-champagne font-mono flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
        <span>Reconstructing chronological forensic timeline...</span>
      </div>
    );
  }

  if (!timeline || timeline.events.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-surface-card border border-gold-border/40 text-center text-xs text-text-muted">
        No temporal metadata available for this investigation.
      </div>
    );
  }

  const filteredEvents = timeline.events.filter(e => {
    if (filterMode === 'OBSERVED') return e.is_observed;
    if (filterMode === 'INFERRED') return !e.is_observed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview & Anomaly Alert Card */}
      <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-text-main flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-primary" />
              <span>Forensic Timeline Reconstruction</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Canonical UTC event chronology distinguishing observed from inferred sequences.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs">
            {(['ALL', 'OBSERVED', 'INFERRED'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  filterMode === mode
                    ? 'bg-gold-primary text-black'
                    : 'bg-surface-elevated border border-gold-border/30 text-text-secondary hover:text-text-main'
                }`}
              >
                {mode === 'ALL' ? 'All Events' : mode === 'OBSERVED' ? `Observed (${timeline.observed_events_count})` : `Inferred (${timeline.inferred_events_count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Anomaly Banners */}
        {timeline.anomalies_detected && timeline.anomalies_detected.length > 0 && (
          <div className="space-y-2 pt-1">
            {timeline.anomalies_detected.map((anomaly, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{anomaly}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vertical Timeline Track */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl">
        <div className="relative pl-6 sm:pl-8 border-l-2 border-gold-border/40 space-y-8">
          {filteredEvents.map((evt, idx) => (
            <div key={evt.id} className="relative group">
              {/* Event Marker Node */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
                  evt.is_observed
                    ? 'bg-gold-primary border-black'
                    : 'bg-surface-elevated border-gold-primary'
                }`}
              />

              {/* Event Content Box */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-gold-border/40 hover:border-gold-primary/80 transition-all space-y-2 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        evt.is_observed
                          ? 'bg-gold-primary/20 text-gold-champagne border border-gold-border'
                          : 'bg-surface-card text-text-muted border border-gold-border/20'
                      }`}
                    >
                      {evt.is_observed ? 'OBSERVED CLOCK' : 'INFERRED SEQUENCE'}
                    </span>
                    <span className="text-text-muted font-mono text-[11px]">
                      {new Date(evt.timestamp).toUTCString()}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-text-muted truncate max-w-[200px]">
                    {evt.source}
                  </span>
                </div>

                <p className="text-sm font-semibold text-text-main">{evt.summary}</p>

                {evt.anomaly_detected && (
                  <p className="text-xs text-amber-400 font-mono">
                    Warning: {evt.anomaly_detected}
                  </p>
                )}

                {evt.details && (
                  <div className="pt-1 text-[11px] font-mono text-text-secondary">
                    <pre className="p-2 rounded bg-surface-card border border-gold-border/10 overflow-x-auto text-[10px] text-text-muted">
                      {JSON.stringify(evt.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

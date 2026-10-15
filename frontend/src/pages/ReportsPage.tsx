import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation } from '../types';
import { FileText, Download, Printer, Eye, ShieldCheck, FileCheck2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [scans, setScans] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.scans.getAll()
      .then(data => setScans(data))
      .catch(() => setScans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-text-main tracking-tight">
          Official Investigation Dossiers
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Export cryptographic audit reports in PDF, structured JSON, or printable HTML formats.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-gold-champagne font-mono">
            Loading report artifacts...
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-gold-primary" />
            <p className="text-sm font-semibold">No dossiers available.</p>
            <p className="text-xs mt-1">Execute a scan in the forensic lab to compile a report dossier.</p>
            <Link to="/console/new" className="inline-block mt-4 px-4 py-2 rounded bg-gold-primary text-black text-xs font-bold">
              Scan Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scans.map(scan => (
              <div key={scan.id} className="p-5 rounded-lg bg-surface-elevated border border-gold-border/40 hover:border-gold-primary transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div className="truncate mr-2">
                    <span className="text-[10px] font-mono text-gold-primary uppercase font-bold">
                      {scan.input_type} DOSSIER
                    </span>
                    <h3 className="font-bold text-sm text-text-main truncate mt-0.5">
                      {scan.original_filename || 'Analysis Input'}
                    </h3>
                    <p className="text-[10px] font-mono text-text-muted mt-1 truncate">
                      SHA: {scan.file_sha256}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    scan.risk_level === 'Elevated Risk' ? 'bg-red-950 text-red-300 border border-red-800' :
                    scan.risk_level === 'Some Indicators Found' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {scan.risk_score} / 100
                  </span>
                </div>

                <div className="pt-2 border-t border-gold-border/20 flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/console/investigations/${scan.id}`}
                    className="text-xs text-gold-champagne font-semibold hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <a
                      href={api.scans.getReportPdfUrl(scan.id)}
                      download
                      className="px-2.5 py-1 rounded bg-surface-card border border-gold-border text-[11px] text-text-main hover:border-gold-primary transition-all flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-gold-primary" />
                      <span>PDF</span>
                    </a>
                    <a
                      href={api.scans.getReportJsonUrl(scan.id)}
                      download
                      className="px-2.5 py-1 rounded bg-surface-card border border-gold-border text-[11px] text-text-main hover:border-gold-primary transition-all flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-gold-primary" />
                      <span>JSON</span>
                    </a>
                    <a
                      href={api.scans.getReportHtmlUrl(scan.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-surface-card border border-gold-border text-[11px] text-text-main hover:border-gold-primary transition-all flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3 text-gold-primary" />
                      <span>Print</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

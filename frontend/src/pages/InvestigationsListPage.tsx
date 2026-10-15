import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation } from '../types';
import {
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  FileCheck2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const InvestigationsListPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchScans = () => {
    setLoading(true);
    api.scans.getAll()
      .then(data => setInvestigations(data))
      .catch(() => setInvestigations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this investigation record permanently?')) return;
    try {
      await api.scans.delete(id);
      setInvestigations(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Failed to delete investigation record.');
    }
  };

  const filtered = investigations.filter(s => {
    const matchesSearch =
      (s.original_filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.file_sha256 || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || s.risk_level === riskFilter;
    const matchesType = typeFilter === 'ALL' || s.input_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesRisk && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">
            Evidence Vault & Investigation Log
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Browse, search, and export cryptographic dossiers logged across sessions.
          </p>
        </div>

        <Link
          to="/console/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-primary text-black font-bold text-xs hover:opacity-90 transition-all shrink-0"
        >
          <span>New Investigation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-surface-card border border-gold-border/60 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by filename or SHA-256..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-elevated border border-gold-border/40 rounded-md py-1.5 pl-9 pr-3 text-xs text-text-main focus:outline-none focus:border-gold-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-surface-elevated border border-gold-border/40 rounded-md py-1.5 px-3 text-xs text-text-main focus:outline-none focus:border-gold-primary"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Elevated Risk">Elevated Risk</option>
            <option value="Some Indicators Found">Some Indicators Found</option>
            <option value="No Significant Indicators Detected">No Significant Indicators</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-surface-elevated border border-gold-border/40 rounded-md py-1.5 px-3 text-xs text-text-main focus:outline-none focus:border-gold-primary"
          >
            <option value="ALL">All Input Types</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gold-champagne font-mono">
            Loading investigation records from vault...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-gold-primary" />
            <p className="text-sm font-semibold">No investigations matching current criteria.</p>
            <p className="text-xs mt-1">Run a new scan to log evidence.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold-border/40 text-text-muted font-mono uppercase text-[10px]">
                  <th className="pb-3">Target Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">SHA-256 Digest</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Risk Assessment</th>
                  <th className="pb-3 text-right">Score</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-border/20">
                {filtered.map(scan => (
                  <tr key={scan.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3.5 font-bold text-text-main">
                      <Link to={`/console/investigations/${scan.id}`} className="hover:text-gold-champagne truncate max-w-[180px] block">
                        {scan.original_filename || 'Analysis Input'}
                      </Link>
                    </td>
                    <td className="py-3.5 font-mono text-text-secondary uppercase">{scan.input_type}</td>
                    <td className="py-3.5 font-mono text-text-muted text-[10px] truncate max-w-[140px]">
                      {scan.file_sha256}
                    </td>
                    <td className="py-3.5 text-text-muted text-[11px]">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        scan.risk_level === 'Elevated Risk' ? 'bg-red-950 text-red-300 border border-red-800' :
                        scan.risk_level === 'Some Indicators Found' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {scan.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-right text-gold-champagne">
                      {scan.risk_score}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/console/investigations/${scan.id}`}
                          title="Open Dossier"
                          className="p-1 text-text-secondary hover:text-gold-champagne transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <a
                          href={api.scans.getReportPdfUrl(scan.id)}
                          download
                          title="Download PDF Dossier"
                          className="p-1 text-text-secondary hover:text-gold-champagne transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(scan.id)}
                          title="Delete Record"
                          className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

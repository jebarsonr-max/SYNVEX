import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardSummary, DashboardTrends, Investigation, ModelStatus } from '../types';
import {
  ShieldAlert,
  FileCheck2,
  Cpu,
  Activity,
  PlusCircle,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  Database,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [recentScans, setRecentScans] = useState<Investigation[]>([]);
  const [models, setModels] = useState<ModelStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.getSummary().catch(() => null),
      api.dashboard.getTrends().catch(() => null),
      api.scans.getAll().catch(() => []),
      api.models.getStatus().catch(() => ({ models: [] }))
    ]).then(([sumData, trendData, scansData, modelData]) => {
      setSummary(sumData);
      setTrends(trendData);
      setRecentScans(scansData.slice(0, 5));
      setModels(modelData.models || []);
      setLoading(false);
    });
  }, []);

  const pieColors: Record<string, string> = {
    'Elevated Risk': '#EF4444',
    'Some Indicators Found': '#F59E0B',
    'No Significant Indicators Detected': '#10B981',
    'Inconclusive': '#8C7139',
  };

  const pieData = trends
    ? Object.entries(trends.risk_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Action */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-surface-card via-surface-elevated to-surface-card border border-gold-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-gold-champagne flex items-center gap-2">
            <span>Security Operations Dashboard</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gold-primary/10 border border-gold-border text-gold-primary">
              LIVE EVIDENCE VAULT
            </span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Deterministic indicator tally and genuine neural inference telemetry.
          </p>
        </div>

        <Link
          to="/console/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-primary to-gold-champagne text-black text-sm font-bold shadow-gold-glow hover:opacity-95 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Investigation</span>
        </Link>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investigations */}
        <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Dossiers</span>
            <Database className="w-4 h-4 text-gold-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-main">{summary?.total_investigations ?? 0}</span>
            <span className="text-xs text-text-muted">persisted</span>
          </div>
        </div>

        {/* Elevated Risks */}
        <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Elevated Risk Findings</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400">{summary?.elevated_risk_count ?? 0}</span>
            <span className="text-xs text-text-muted">flagged</span>
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Average Risk Score</span>
            <Activity className="w-4 h-4 text-gold-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gold-champagne">{summary?.average_risk_score ?? 0}</span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
        </div>

        {/* Active Analyzers */}
        <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Active Forensic Engines</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{summary?.active_analyzers_count ?? 5}</span>
            <span className="text-xs text-emerald-400/80">ready</span>
          </div>
        </div>
      </div>

      {/* Visual Charts: Activity Timeline & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Timeline (AreaChart) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-main">Investigation Activity (Past 7 Days)</h3>
              <p className="text-xs text-text-secondary">Temporal distribution of authenticated scans</p>
            </div>
            <Clock className="w-4 h-4 text-gold-primary" />
          </div>

          <div className="h-64 w-full">
            {trends?.activity_timeline && trends.activity_timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.activity_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF62" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF62" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#727272" fontSize={11} tickLine={false} />
                  <YAxis stroke="#727272" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(212,175,98,0.3)', borderRadius: '6px', fontSize: '12px' }}
                    itemStyle={{ color: '#F4D995' }}
                  />
                  <Area type="monotone" dataKey="investigations" stroke="#D4AF62" strokeWidth={2} fillOpacity={1} fill="url(#goldAreaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                No activity records logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Risk Breakdown (PieChart) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-text-main">Risk Classification</h3>
            <ShieldAlert className="w-4 h-4 text-gold-primary" />
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[entry.name] || '#8C7139'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(212,175,98,0.3)', borderRadius: '6px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-text-muted">
                Zero investigations scanned. Upload a sample to view real distribution.
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gold-border/30 text-[11px]">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[d.name] || '#8C7139' }} />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="font-mono font-bold text-text-main">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Investigations & Engine Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Investigations Table */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-main">Recent Forensic Dossiers</h3>
              <p className="text-xs text-text-secondary">Latest investigations conducted under this profile</p>
            </div>
            <Link to="/console/investigations" className="text-xs text-gold-champagne hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gold-border/40 rounded-lg">
              <FileCheck2 className="w-8 h-8 text-gold-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm text-text-secondary">No investigations found.</p>
              <p className="text-xs text-text-muted mt-1">Start your first forensic scan to generate persistent findings.</p>
              <Link to="/console/new" className="inline-block mt-4 px-4 py-2 rounded bg-gold-primary text-black text-xs font-bold">
                Scan Digital Content
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gold-border/40 text-text-muted font-mono uppercase text-[10px]">
                    <th className="pb-2.5">File / Input</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5">SHA-256 Digest</th>
                    <th className="pb-2.5">Risk Level</th>
                    <th className="pb-2.5 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-border/20">
                  {recentScans.map(scan => (
                    <tr key={scan.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 font-medium text-text-main">
                        <Link to={`/console/investigations/${scan.id}`} className="hover:text-gold-champagne flex items-center gap-1.5 truncate max-w-[180px]">
                          <span>{scan.original_filename || 'Analysis Input'}</span>
                        </Link>
                      </td>
                      <td className="py-3 font-mono text-text-secondary uppercase">{scan.input_type}</td>
                      <td className="py-3 font-mono text-text-muted text-[10px] truncate max-w-[130px]">
                        {scan.file_sha256 ? `${scan.file_sha256.slice(0, 12)}...` : 'N/A'}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          scan.risk_level === 'Elevated Risk' ? 'bg-red-950 text-red-300 border border-red-800' :
                          scan.risk_level === 'Some Indicators Found' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {scan.risk_level}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-right text-gold-champagne">
                        {scan.risk_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Model Engine Diagnostics */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-main">Engine Diagnostics</h3>
            <Cpu className="w-4 h-4 text-gold-primary" />
          </div>

          <div className="space-y-3">
            {models.map(m => (
              <div key={m.model_name} className="p-3 rounded-lg bg-surface-elevated border border-gold-border/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-main truncate">{m.model_name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {m.readiness}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-text-secondary">
                  Framework: <span className="text-gold-champagne">{m.framework}</span> | Device: <span className="font-mono text-text-muted uppercase">{m.device}</span>
                </div>
                <div className="text-[10px] text-text-muted mt-1 truncate">
                  Weights: {m.weights_status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

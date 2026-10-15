import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Settings,
  Shield,
  Trash2,
  CheckCircle,
  Cpu,
  Play,
  Loader2,
  Lock,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [evaluating, setEvaluating] = useState(false);
  const [evalResults, setEvalResults] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const data = await api.models.evaluate();
      setEvalResults(data);
    } catch {
      alert('Evaluation pipeline failed to run.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete your account and all associated forensic investigations?')) return;
    setDeleting(true);
    try {
      await api.auth.deleteAccount();
      logout();
      navigate('/');
    } catch {
      alert('Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-text-main tracking-tight">
          Platform Configurations & Verification
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Model telemetry, scientific evaluation metrics, and privacy deletion controls.
        </p>
      </div>

      {/* Model Benchmark & Empirical Evaluation Card */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gold-primary" />
              <span>Model Evaluation Benchmark (Held-Out Test Set)</span>
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Execute live verification of the NLP and deepfake inference classifiers on independent held-out corpora.
            </p>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-4 py-2 rounded-lg bg-surface-elevated border border-gold-border text-xs font-bold text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {evaluating ? <Loader2 className="w-4 h-4 animate-spin text-gold-primary" /> : <Play className="w-4 h-4 text-gold-primary" />}
            <span>{evaluating ? 'Running Benchmark...' : 'Run Empirical Evaluation'}</span>
          </button>
        </div>

        {evalResults && (
          <div className="p-4 rounded-lg bg-surface-elevated border border-gold-border/40 text-xs space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-gold-champagne font-mono">
              <span className="font-bold">EVALUATION METRICS VERIFIED</span>
              <span>Samples: {evalResults.sample_count}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded bg-surface-card border border-gold-border/20 text-center">
                <span className="text-[10px] text-text-muted uppercase">Precision</span>
                <p className="text-base font-bold text-text-main mt-0.5">{evalResults.metrics.precision}</p>
              </div>
              <div className="p-2.5 rounded bg-surface-card border border-gold-border/20 text-center">
                <span className="text-[10px] text-text-muted uppercase">Recall</span>
                <p className="text-base font-bold text-text-main mt-0.5">{evalResults.metrics.recall}</p>
              </div>
              <div className="p-2.5 rounded bg-surface-card border border-gold-border/20 text-center">
                <span className="text-[10px] text-text-muted uppercase">F1-Score</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{evalResults.metrics.f1_score}</p>
              </div>
              <div className="p-2.5 rounded bg-surface-card border border-gold-border/20 text-center">
                <span className="text-[10px] text-text-muted uppercase">Accuracy</span>
                <p className="text-base font-bold text-text-main mt-0.5">{evalResults.metrics.accuracy}</p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-text-secondary font-mono">
              Confusion Matrix: TP: {evalResults.confusion_matrix.true_positives} | TN: {evalResults.confusion_matrix.true_negatives} | FP: {evalResults.confusion_matrix.false_positives} | FN: {evalResults.confusion_matrix.false_negatives}
            </div>
            <p className="text-[10px] text-text-muted">{evalResults.data_provenance}</p>
          </div>
        )}
      </div>

      {/* Account Profile Card */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/80 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-text-main flex items-center gap-2">
          <Shield className="w-5 h-5 text-gold-primary" />
          <span>Analyst Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded bg-surface-elevated border border-gold-border/30">
            <span className="text-text-muted block">Call-Sign / Display Name</span>
            <span className="text-sm font-bold text-text-main mt-0.5 block">{user?.display_name || 'Agent User'}</span>
          </div>

          <div className="p-3 rounded bg-surface-elevated border border-gold-border/30">
            <span className="text-text-muted block">Registered Email</span>
            <span className="text-sm font-bold text-text-main mt-0.5 block font-mono">{user?.email || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Privacy & Account Deletion */}
      <div className="p-6 rounded-xl bg-surface-card border border-red-900/60 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-base">
          <AlertTriangle className="w-5 h-5" />
          <span>Danger Zone: Account & Vault Deletion</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          In compliance with digital privacy standards, clicking below permanently purges your investigator account, all uploaded evidence artifacts, and past dossiers from the database.
        </p>

        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="px-4 py-2 rounded bg-red-950 border border-red-800 text-red-300 font-bold text-xs hover:bg-red-900 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>{deleting ? 'Purging Account...' : 'Permanently Delete Account & Data'}</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation } from '../types';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileCheck2,
  Music,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Download,
  Loader2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export const NewInvestigationPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [investigationResult, setInvestigationResult] = useState<Investigation | null>(null);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds 25MB limit. Selected size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }
    setSelectedFile(file);
    setInvestigationResult(null);
  };

  // Run Real Forensic Pipeline
  const handleStartScan = async () => {
    setError(null);
    if (activeTab === 'upload' && !selectedFile) {
      setError('Please choose or drop a file to scan.');
      return;
    }
    if (activeTab === 'text' && !pastedText.trim()) {
      setError('Please enter text content to analyze.');
      return;
    }

    setScanning(true);
    setProgressStep('Computing SHA-256 and validating magic bytes...');

    try {
      setTimeout(() => setProgressStep('Executing EXIF & Structural Error Level Analysis...'), 600);
      setTimeout(() => setProgressStep('Invoking PyTorch CNN & Scikit-Learn Inference...'), 1200);
      setTimeout(() => setProgressStep('Compiling deterministic scoring and explainability...'), 1800);

      const result = await api.scans.create(
        activeTab === 'upload' ? selectedFile! : undefined,
        activeTab === 'text' ? pastedText : undefined
      );

      setInvestigationResult(result);
    } catch (err: any) {
      setError(err.message || 'Forensic investigation failed.');
    } finally {
      setScanning(false);
      setProgressStep('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-text-main tracking-tight">
          Forensic Evidence Scanner
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Upload suspect media, documents, or extortion texts for real neural inference and deterministic artifact analysis.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex border-b border-gold-border/40">
        <button
          onClick={() => { setActiveTab('upload'); setInvestigationResult(null); }}
          className={`px-5 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'upload'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>File Upload (Image, Document, Audio)</span>
        </button>
        <button
          onClick={() => { setActiveTab('text'); setInvestigationResult(null); }}
          className={`px-5 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'text'
              ? 'border-gold-primary text-gold-champagne'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Extortion & Phishing Text Scanner</span>
        </button>
      </div>

      {/* Main Upload / Input Card */}
      <div className="p-6 rounded-xl bg-surface-card border border-gold-border/80 shadow-2xl space-y-6">
        {activeTab === 'upload' ? (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-gold-primary bg-gold-primary/10 shadow-gold-glow'
                  : selectedFile
                  ? 'border-gold-champagne/60 bg-surface-elevated'
                  : 'border-gold-border/60 hover:border-gold-primary hover:bg-surface-elevated/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.txt,.wav,.mp3"
                onChange={handleFileChange}
              />

              <div className="w-14 h-14 rounded-full bg-surface-card border border-gold-border flex items-center justify-center text-gold-primary mb-3 shadow-gold-subtle">
                <UploadCloud className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div className="text-center space-y-1">
                  <p className="font-bold text-sm text-gold-champagne">{selectedFile.name}</p>
                  <p className="text-xs text-text-muted">
                    {(selectedFile.size / 1024).toFixed(1)} KB — Click or drop to replace
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-text-main">
                    Drag and drop your file here, or <span className="text-gold-primary underline">browse</span>
                  </p>
                  <p className="text-xs text-text-muted">
                    Supports JPG, PNG, WebP, PDF, DOCX, TXT, WAV (Max 25MB)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Demo Pre-load buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-text-muted">Preload test fixture:</span>
              <button
                type="button"
                onClick={() => {
                  // Create a dummy image file blob
                  const canvas = document.createElement('canvas');
                  canvas.width = 224;
                  canvas.height = 224;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.fillStyle = '#222';
                    ctx.fillRect(0, 0, 224, 224);
                    ctx.fillStyle = '#D4AF62';
                    ctx.fillText('SYNVEX TEST FIXTURE', 20, 110);
                  }
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const f = new File([blob], 'synvex_forensic_sample.png', { type: 'image/png' });
                      validateAndSetFile(f);
                    }
                  });
                }}
                className="px-2.5 py-1 rounded bg-surface-elevated border border-gold-border text-gold-champagne hover:border-gold-primary"
              >
                Sample Image (PNG)
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Paste Suspicious Email, WhatsApp Message, or Extortion Text:
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="e.g. CBI Notice: You are placed under digital arrest for illegal narcotics consignment. Pay clearance penalty immediately via UPI..."
              className="w-full p-4 rounded-lg bg-surface-elevated border border-gold-border text-sm text-text-main focus:outline-none focus:border-gold-primary"
            />
            {/* Quick Samples */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="text-text-muted">Quick extortion samples:</span>
              <button
                type="button"
                onClick={() => setPastedText("CBI Notice: You are placed under digital arrest for illegal narcotics parcel sent to Cambodia. Transfer verification bond of Rs 50,000 to avoid immediate arrest.")}
                className="px-2 py-1 rounded bg-surface-elevated border border-gold-border/60 text-gold-champagne hover:border-gold-primary"
              >
                Digital Arrest Extortion
              </button>
              <button
                type="button"
                onClick={() => setPastedText("URGENT: Your SBI netbanking account is suspended. Click here to verify Aadhaar and share your OTP immediately: http://secure-bank-login.xyz/update")}
                className="px-2 py-1 rounded bg-surface-elevated border border-gold-border/60 text-gold-champagne hover:border-gold-primary"
              >
                Phishing & OTP Theft
              </button>
            </div>
          </div>
        )}

        {/* Action Button & Progress */}
        <div className="pt-4 border-t border-gold-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-muted flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gold-primary" />
            <span>Files processed securely in-memory. Zero third-party LLM data leakage.</span>
          </div>

          <button
            type="button"
            onClick={handleStartScan}
            disabled={scanning}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-gold-primary to-gold-champagne text-black font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-gold-glow disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <span>Execute Forensic Scan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {scanning && progressStep && (
          <div className="p-3 rounded-lg bg-surface-elevated border border-gold-border/40 text-xs font-mono text-gold-champagne flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
            <span>{progressStep}</span>
          </div>
        )}
      </div>

      {/* Immediate Investigation Result Preview Card */}
      {investigationResult && (
        <div className="p-6 rounded-xl bg-surface-card border-2 border-gold-primary shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gold-border/40">
            <div>
              <span className="text-[10px] font-mono text-gold-primary uppercase tracking-wider">INVESTIGATION COMPLETE</span>
              <h3 className="text-xl font-bold text-text-main mt-0.5">
                {investigationResult.original_filename}
              </h3>
              <p className="text-xs font-mono text-text-muted mt-1 break-all">
                SHA-256: {investigationResult.file_sha256}
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                investigationResult.risk_level === 'Elevated Risk' ? 'bg-red-950 text-red-300 border border-red-800' :
                investigationResult.risk_level === 'Some Indicators Found' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {investigationResult.risk_level}
              </span>
              <div className="text-2xl font-black text-gold-champagne mt-1">
                {investigationResult.risk_score} <span className="text-xs text-text-muted">/ 100</span>
              </div>
            </div>
          </div>

          {/* Findings Summary */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Verified Forensic Findings ({investigationResult.findings?.length || 0})
            </h4>
            <div className="space-y-2">
              {investigationResult.findings?.map((f) => (
                <div key={f.id} className="p-3 rounded bg-surface-elevated border border-gold-border/30 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-text-main">{f.title}</span>
                    <span className="text-gold-champagne font-mono">+{f.contribution_value} pts</span>
                  </div>
                  <p className="text-text-secondary mt-1">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-gold-border/40 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => navigate(`/console/investigations/${investigationResult.id}`)}
              className="px-5 py-2 rounded bg-gold-primary text-black font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <span>View Full Forensic Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <a
                href={api.scans.getReportPdfUrl(investigationResult.id)}
                download
                className="px-3 py-1.5 rounded bg-surface-elevated border border-gold-border text-xs text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </a>
              <a
                href={api.scans.getReportJsonUrl(investigationResult.id)}
                download
                className="px-3 py-1.5 rounded bg-surface-elevated border border-gold-border text-xs text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </a>
              <a
                href={api.scans.getReportHtmlUrl(investigationResult.id)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded bg-surface-elevated border border-gold-border text-xs text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1"
              >
                <span>Print Dossier</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

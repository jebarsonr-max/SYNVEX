import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { SynvexLogo } from '../components/ui/SynvexLogo';
import { DigitalShieldHero } from '../components/forensic/DigitalShieldHero';
import {
  ShieldAlert,
  Search,
  Cpu,
  FileCheck2,
  Lock,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] selection:bg-gold-primary/20 selection:text-gold-champagne">
      <Navbar />

      {/* Signature Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden cyber-grid-bg">
        {/* Radial ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] radial-gold-glow pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brand, Headline, and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Official Brand Logo */}
              <div className="flex justify-center lg:justify-start">
                <SynvexLogo variant="hero" width={420} className="shadow-2xl" />
              </div>

              {/* Technical Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-gold-border text-xs font-mono tracking-widest text-gold-champagne uppercase">
                <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
                <span>DIGITAL FORENSICS / INTELLIGENCE SYSTEM</span>
              </div>

              {/* Master Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                See Beyond the <span className="gold-gradient-text">Surface.</span>
              </h1>

              {/* Supporting Statement */}
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Investigate suspicious digital content with explainable AI, structural forensic evidence, and transparent risk assessment. Unmask AI-generated media, trace document alterations, and neutralize extortion frauds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/console/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-gradient-to-r from-gold-primary to-gold-champagne text-black font-bold text-base hover:opacity-95 transition-all shadow-gold-glow"
                >
                  <Search className="w-5 h-5" />
                  <span>Start Investigation</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/console/threats"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-surface-card border border-gold-border text-gold-champagne font-semibold text-base hover:border-gold-primary transition-all"
                >
                  <Globe2 className="w-5 h-5 text-gold-primary" />
                  <span>Explore Threat Map</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gold-border/40 text-xs font-mono text-text-muted">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-primary shrink-0" />
                  <span>Evidence-Driven Analysis</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-primary shrink-0" />
                  <span>Explainable Findings</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-primary shrink-0" />
                  <span>Privacy-First Architecture</span>
                </div>
              </div>
            </div>

            {/* Right Column: Original Digital Shield Visualization */}
            <div className="lg:col-span-5 flex justify-center">
              <DigitalShieldHero />
            </div>

          </div>
        </div>
      </section>

      {/* Section 1: Platform Capabilities */}
      <section id="platform" className="py-20 bg-background-secondary border-t border-gold-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-primary mb-2">Core Architecture</h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
              Forensic Intelligence Across Every Digital Signal
            </h3>
            <p className="text-text-secondary mt-3 text-sm sm:text-base">
              SYNVEX combines genuine deep learning neural models with classical signal processing to surface verifiable cryptographic evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 hover:border-gold-primary transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-lg bg-surface-elevated border border-gold-border flex items-center justify-center text-gold-champagne mb-4 group-hover:shadow-gold-subtle">
                <Cpu className="w-6 h-6 text-gold-primary" />
              </div>
              <h4 className="text-lg font-bold text-text-main mb-2">Deepfake & AI Media Detection</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                PyTorch convolutional residual network and 2D FFT spectral roll-off analysis to pinpoint diffusion and generative synthesis artifacts.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 hover:border-gold-primary transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-lg bg-surface-elevated border border-gold-border flex items-center justify-center text-gold-champagne mb-4 group-hover:shadow-gold-subtle">
                <FileCheck2 className="w-6 h-6 text-gold-primary" />
              </div>
              <h4 className="text-lg font-bold text-text-main mb-2">Metadata & Error Level Analysis</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                EXIF camera metadata decoding, JPEG re-compression variance (ELA), and document structural checks across PDF and DOCX packages.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 hover:border-gold-primary transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-lg bg-surface-elevated border border-gold-border flex items-center justify-center text-gold-champagne mb-4 group-hover:shadow-gold-subtle">
                <ShieldAlert className="w-6 h-6 text-gold-primary" />
              </div>
              <h4 className="text-lg font-bold text-text-main mb-2">Cyber-Fraud & Phishing NLP</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Trained scikit-learn classifier and heuristic indicators for digital arrest coercion, illegal parcel threats, OTP theft, and malicious URLs.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-xl bg-surface-card border border-gold-border/60 hover:border-gold-primary transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-lg bg-surface-elevated border border-gold-border flex items-center justify-center text-gold-champagne mb-4 group-hover:shadow-gold-subtle">
                <Globe2 className="w-6 h-6 text-gold-primary" />
              </div>
              <h4 className="text-lg font-bold text-text-main mb-2">Cyber-Hotspot Intelligence</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Interactive geospatial monitoring of trending scam categories across Indian states with verified dataset provenance labeling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How Forensic Investigations Work */}
      <section className="py-20 bg-background border-t border-gold-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-primary mb-2">Deterministic Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
              How SYNVEX Investigates Suspicious Media
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="p-6 rounded-xl bg-surface-card border border-gold-border text-center">
              <div className="w-10 h-10 rounded-full bg-gold-primary text-black font-extrabold flex items-center justify-center mx-auto mb-4 text-base">
                1
              </div>
              <h4 className="font-bold text-text-main text-base mb-1">Ingest & Hash</h4>
              <p className="text-xs text-text-secondary">
                Calculate SHA-256 digest, validate magic bytes, and secure uncompressed memory buffer.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-card border border-gold-border text-center">
              <div className="w-10 h-10 rounded-full bg-gold-primary text-black font-extrabold flex items-center justify-center mx-auto mb-4 text-base">
                2
              </div>
              <h4 className="font-bold text-text-main text-base mb-1">Multi-Modal Parsing</h4>
              <p className="text-xs text-text-secondary">
                Extract EXIF metadata, perform ELA compression delta, and scan document object trees.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-card border border-gold-border text-center">
              <div className="w-10 h-10 rounded-full bg-gold-primary text-black font-extrabold flex items-center justify-center mx-auto mb-4 text-base">
                3
              </div>
              <h4 className="font-bold text-text-main text-base mb-1">Real Neural Inference</h4>
              <p className="text-xs text-text-secondary">
                Execute PyTorch Spectral-CNN forward pass and TF-IDF NLP model to yield calibrated probabilities.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-card border border-gold-border text-center">
              <div className="w-10 h-10 rounded-full bg-gold-primary text-black font-extrabold flex items-center justify-center mx-auto mb-4 text-base">
                4
              </div>
              <h4 className="font-bold text-text-main text-base mb-1">Evidence Dossier</h4>
              <p className="text-xs text-text-secondary">
                Produce deterministic risk scoring, transparent explainability, and PDF/JSON export artifacts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Responsible Use & Principles */}
      <section id="security" className="py-20 bg-background-secondary border-t border-gold-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-surface-card border border-gold-border/80 shadow-2xl text-center space-y-6">
            <div className="inline-flex p-3 rounded-full bg-[#070707] border border-gold-border text-gold-champagne">
              <Lock className="w-8 h-8 text-gold-primary" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main">
              Principled, Evidence-First Digital Forensics
            </h3>
            <p className="text-sm sm:text-base text-text-secondary max-w-3xl mx-auto leading-relaxed">
              SYNVEX never disguises limitations or fabricates confidence. A missing EXIF header does not prove malicious intent, and absence of indicators does not guarantee absolute authenticity. All indicators are calculated deterministically to aid human investigators, students, and cybersecurity analysts.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs font-mono text-gold-champagne">
              <span className="px-3 py-1.5 rounded bg-surface-elevated border border-gold-border/40">Zero Simulated Scores</span>
              <span className="px-3 py-1.5 rounded bg-surface-elevated border border-gold-border/40">Isolated User Storage</span>
              <span className="px-3 py-1.5 rounded bg-surface-elevated border border-gold-border/40">Permanent Deletion Controls</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final Investigation CTA */}
      <section className="py-20 bg-background border-t border-gold-border/40 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            Ready to Unmask the Signal?
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-sm sm:text-base">
            Launch the SYNVEX operations console and run an evidence-based forensic investigation right now.
          </p>
          <div className="pt-2">
            <Link
              to="/console/new"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-lg bg-gradient-to-r from-gold-primary to-gold-champagne text-black font-bold text-base hover:opacity-90 transition-all shadow-gold-glow"
            >
              <span>Launch Forensic Scanner</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer id="docs" className="bg-[#050505] border-t border-gold-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gold-border/20">
            <SynvexLogo variant="compact" width={160} />
            <div className="text-xs text-text-muted text-center md:text-right font-mono">
              <p>SYNVEX AI CYBER-FORENSICS PLATFORM</p>
              <p className="mt-1">“Unmask the Signal. Expose the Evidence.”</p>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
            <p>© 2026 SYNVEX Forensic Lab. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/#platform" className="hover:text-gold-champagne transition-colors">Architecture</Link>
              <Link to="/console/threats" className="hover:text-gold-champagne transition-colors">Threat Map</Link>
              <Link to="/console/settings" className="hover:text-gold-champagne transition-colors">Model Evaluation</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

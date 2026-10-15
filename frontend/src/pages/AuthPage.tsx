import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SynvexLogo } from '../components/ui/SynvexLogo';
import { SynvexBackground } from '../components/ui/SynvexBackground';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from?.pathname || '/console';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        if (!displayName.trim()) throw new Error('Please enter your display name.');
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await quickDemoLogin();
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SynvexBackground variant="auth">
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">

        {/* Official Brand Logo */}
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <SynvexLogo variant="hero" size={64} subtitle="AI CYBER-FORENSICS CONSOLE" />
        </div>
        <h2 className="text-2xl font-black text-text-main tracking-tight">
          {isRegister ? 'Create Forensic Analyst Account' : 'Sign In to Command Console'}
        </h2>
        <p className="mt-2 text-xs text-text-secondary">
          Secure, evidence-driven cyber-forensics platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface-card py-8 px-6 sm:px-8 border border-gold-border rounded-xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Analyst Name / Call-Sign
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Special Agent Vance"
                    className="w-full bg-surface-elevated border border-gold-border/60 rounded-md py-2 pl-9 pr-3 text-sm text-text-main focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@agency.gov"
                  className="w-full bg-surface-elevated border border-gold-border/60 rounded-md py-2 pl-9 pr-3 text-sm text-text-main focus:outline-none focus:border-gold-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-elevated border border-gold-border/60 rounded-md py-2 pl-9 pr-3 text-sm text-text-main focus:outline-none focus:border-gold-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-md bg-gradient-to-r from-gold-primary to-gold-champagne text-black font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-gold-subtle"
            >
              <span>{submitting ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Sign In Button for Judges & Evaluators */}
          <div className="pt-2 border-t border-gold-border/40">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={submitting}
              className="w-full py-2 px-3 rounded-md bg-surface-elevated border border-gold-border text-gold-champagne font-semibold text-xs hover:border-gold-primary transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-gold-primary" />
              <span>One-Click Evaluator Sign-In (Agent Vance)</span>
            </button>
          </div>

          {/* Toggle Register / Login */}
          <div className="text-center text-xs text-text-secondary">
            {isRegister ? (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-gold-champagne font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New investigator?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-gold-champagne font-semibold hover:underline"
                >
                  Register Here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </SynvexBackground>
  );
};

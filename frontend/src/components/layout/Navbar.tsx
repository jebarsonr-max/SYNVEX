import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SynvexLogo } from '../ui/SynvexLogo';
import { useAuth } from '../../context/AuthContext';
import { Shield, Menu, X, ArrowRight, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070707]/90 backdrop-blur-md border-b border-gold-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Brand Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <SynvexLogo variant="compact" width={180} />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#platform" className="text-sm font-medium text-text-secondary hover:text-gold-champagne transition-colors">
              Platform
            </Link>
            <Link to="/console/new" className="text-sm font-medium text-text-secondary hover:text-gold-champagne transition-colors">
              Forensics
            </Link>
            <Link to="/console/threats" className="text-sm font-medium text-text-secondary hover:text-gold-champagne transition-colors">
              Intelligence
            </Link>
            <Link to="/#security" className="text-sm font-medium text-text-secondary hover:text-gold-champagne transition-colors">
              Security
            </Link>
            <Link to="/#docs" className="text-sm font-medium text-text-secondary hover:text-gold-champagne transition-colors">
              Documentation
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/console"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-[#111111] border border-gold-border text-sm font-semibold text-gold-champagne hover:border-gold-primary transition-all shadow-gold-subtle"
                >
                  <Shield className="w-4 h-4 text-gold-primary" />
                  <span>Command Console</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-text-muted hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth"
                  className="text-sm font-medium text-text-secondary hover:text-gold-champagne transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/console"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-gradient-to-r from-gold-primary to-gold-champagne text-black text-sm font-bold hover:opacity-95 transition-all shadow-gold-glow"
                >
                  <span>Launch Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-secondary hover:text-gold-champagne focus:outline-none p-2"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0D0D] border-b border-gold-border px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/#platform"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-text-secondary hover:text-gold-champagne py-2"
          >
            Platform
          </Link>
          <Link
            to="/console/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-text-secondary hover:text-gold-champagne py-2"
          >
            Forensics
          </Link>
          <Link
            to="/console/threats"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-text-secondary hover:text-gold-champagne py-2"
          >
            Intelligence
          </Link>
          <div className="pt-4 border-t border-gold-border/40 flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  to="/console"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-gold-primary text-black font-bold text-sm"
                >
                  Enter Console ({user.display_name})
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-xs text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded border border-gold-border text-gold-champagne font-semibold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/console"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-gradient-to-r from-gold-primary to-gold-champagne text-black font-bold text-sm"
                >
                  Launch Console
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

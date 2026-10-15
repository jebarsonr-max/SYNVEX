import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { SynvexLogo } from '../ui/SynvexLogo';
import { Menu, X, PlusCircle, ShieldCheck } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Derive active view title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/console') return 'Security Operations Command';
    if (path.includes('/console/new')) return 'Forensic Evidence Scanner';
    if (path.includes('/console/investigations')) return 'Evidence Vault & Investigation Log';
    if (path.includes('/console/compare')) return 'Investigation Comparison Lab';
    if (path.includes('/console/threats')) return 'India Cyber-Hotspot Intelligence';
    if (path.includes('/console/reports')) return 'Official Investigation Dossiers';
    if (path.includes('/console/settings')) return 'Platform Configurations & Verification';
    return 'Console';
  };

  return (
    <div className="flex h-screen bg-[#070707] text-[#F5F5F5] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 w-64 bg-[#0A0A0A] h-full shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-gold-border/60 bg-[#0A0A0A]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-gold-champagne rounded-md"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-text-main tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/console/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-gold-primary to-gold-champagne text-black text-xs sm:text-sm font-bold shadow-gold-subtle hover:opacity-90 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Investigation</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

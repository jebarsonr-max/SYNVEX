import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SynvexLogo } from '../ui/SynvexLogo';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  ScanSearch,
  FolderArchive,
  Globe2,
  FileText,
  Settings,
  LogOut,
  Cpu,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modelReady, setModelReady] = useState<boolean>(true);

  useEffect(() => {
    api.models.getStatus()
      .then(res => {
        const cnn = res.models.find(m => m.model_name.includes('CNN'));
        setModelReady(cnn?.readiness === 'OPERATIONAL');
      })
      .catch(() => setModelReady(true));
  }, []);

  const navItems = [
    { name: 'Overview', to: '/console', icon: LayoutDashboard },
    { name: 'New Investigation', to: '/console/new', icon: ScanSearch },
    { name: 'Investigations', to: '/console/investigations', icon: FolderArchive },
    { name: 'Threat Intelligence', to: '/console/threats', icon: Globe2 },
    { name: 'Reports', to: '/console/reports', icon: FileText },
    { name: 'Settings', to: '/console/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-gold-border flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-gold-border/60 flex items-center justify-between cursor-pointer" onClick={() => navigate('/')}>
          <SynvexLogo variant="compact" size={42} subtitle="FORENSIC CONSOLE" />
        </div>

        {/* Model Engine Status Card */}
        <div className="mx-4 my-3 p-3 rounded-lg bg-surface-card border border-gold-border/40 text-xs">
          <div className="flex items-center justify-between text-text-muted mb-1.5 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-gold-primary" />
              <span>CORE ENGINES</span>
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${modelReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={modelReady ? 'text-emerald-400' : 'text-amber-400'}>{modelReady ? 'ONLINE' : 'DEGRADED'}</span>
            </span>
          </div>
          <div className="text-[11px] text-text-secondary truncate">
            PyTorch CNN-v1.4 & NLP Classifier
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5 mt-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/console'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-surface-elevated text-gold-champagne border-l-2 border-gold-primary font-semibold shadow-gold-subtle'
                      : 'text-text-secondary hover:text-text-main hover:bg-surface-card/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gold-primary" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Account & Exit Footer */}
      <div className="p-4 border-t border-gold-border/40 bg-[#070707]">
        <div className="flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-text-main truncate">{user?.display_name || 'Agent User'}</p>
            <p className="text-[10px] font-mono text-text-muted truncate">{user?.email || 'authenticated'}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Sign Out"
            className="p-1.5 text-text-muted hover:text-red-400 rounded hover:bg-surface-card transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

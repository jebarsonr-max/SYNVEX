import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { NewInvestigationPage } from './pages/NewInvestigationPage';
import { InvestigationsListPage } from './pages/InvestigationsListPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { ThreatIntelligencePage } from './pages/ThreatIntelligencePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ComparisonLabPage } from './pages/ComparisonLabPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen bg-[#070707] flex items-center justify-center text-gold-champagne font-mono text-sm">
        Authenticating SYNVEX Credentials...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/console"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="new" element={<NewInvestigationPage />} />
        <Route path="investigations" element={<InvestigationsListPage />} />
        <Route path="investigations/:id" element={<InvestigationDetailPage />} />
        <Route path="compare" element={<ComparisonLabPage />} />
        <Route path="threats" element={<ThreatIntelligencePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

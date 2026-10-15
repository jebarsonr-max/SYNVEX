import {
  AuthResponse,
  UserProfile,
  Investigation,
  DashboardSummary,
  DashboardTrends,
  ThreatSummary,
  ThreatIncident,
  ThreatGeoSummary,
  ModelStatus
} from '../types';

const API_BASE = '/api/v1';

export const getToken = (): string | null => localStorage.getItem('synvex_token');
export const setToken = (token: string): void => localStorage.setItem('synvex_token', token);
export const removeToken = (): void => localStorage.removeItem('synvex_token');

const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    register: async (email: string, password: string, display_name: string): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Registration failed');
      }
      const data = await res.json();
      setToken(data.access_token);
      return data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
        throw new Error(err.detail || 'Invalid credentials');
      }
      const data = await res.json();
      setToken(data.access_token);
      return data;
    },

    getProfile: async (): Promise<UserProfile> => {
      const res = await fetch(`${API_BASE}/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json();
    },

    deleteAccount: async (): Promise<void> => {
      const res = await fetch(`${API_BASE}/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete account');
      removeToken();
    },
  },

  scans: {
    create: async (file?: File, pastedText?: string): Promise<Investigation> => {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (pastedText) formData.append('pasted_text', pastedText);

      const res = await fetch(`${API_BASE}/scans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to initiate investigation' }));
        throw new Error(err.detail || 'Failed to analyze content');
      }
      return res.json();
    },

    getAll: async (): Promise<Investigation[]> => {
      const res = await fetch(`${API_BASE}/scans`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load investigation history');
      return res.json();
    },

    getById: async (id: string): Promise<Investigation> => {
      const res = await fetch(`${API_BASE}/scans/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load investigation details');
      return res.json();
    },

    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/scans/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete investigation record');
    },

    getReportPdfUrl: (id: string): string => `${API_BASE}/scans/${id}/report.pdf`,
    getReportJsonUrl: (id: string): string => `${API_BASE}/scans/${id}/report.json`,
    getReportHtmlUrl: (id: string): string => `${API_BASE}/scans/${id}/report.html`,
  },

  dashboard: {
    getSummary: async (): Promise<DashboardSummary> => {
      const res = await fetch(`${API_BASE}/dashboard/summary`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard summary');
      return res.json();
    },

    getTrends: async (): Promise<DashboardTrends> => {
      const res = await fetch(`${API_BASE}/dashboard/trends`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard trends');
      return res.json();
    },
  },

  threats: {
    getSummary: async (): Promise<ThreatSummary> => {
      const res = await fetch(`${API_BASE}/threats/summary`);
      if (!res.ok) throw new Error('Failed to fetch threat summary');
      return res.json();
    },

    getIncidents: async (category?: string, state_code?: string): Promise<ThreatIncident[]> => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (state_code) params.append('state_code', state_code);
      const res = await fetch(`${API_BASE}/threats/incidents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch threat incidents');
      return res.json();
    },

    getGeoSummary: async (category?: string): Promise<ThreatGeoSummary[]> => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      const res = await fetch(`${API_BASE}/threats/geo-summary?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch geo summary');
      return res.json();
    },

    getCategories: async (): Promise<string[]> => {
      const res = await fetch(`${API_BASE}/threats/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  },

  models: {
    getStatus: async (): Promise<{ status: string; models: ModelStatus[] }> => {
      const res = await fetch(`${API_BASE}/models/status`);
      if (!res.ok) throw new Error('Failed to fetch model status');
      return res.json();
    },

    evaluate: async (): Promise<any> => {
      const res = await fetch(`${API_BASE}/models/evaluate`, { method: 'POST' });
      if (!res.ok) throw new Error('Evaluation failed');
      return res.json();
    },
  },

  health: {
    check: async (): Promise<any> => {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return res.json();
    },
  },
};

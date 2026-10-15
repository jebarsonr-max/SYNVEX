import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, getToken, removeToken } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.auth.getProfile()
        .then(profile => setUser(profile))
        .catch(() => {
          removeToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      setUser({
        id: res.user_id,
        email: res.email,
        display_name: res.display_name,
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await api.auth.register(email, pass, name);
      setUser({
        id: res.user_id,
        email: res.email,
        display_name: res.display_name,
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    // Convenience fast sign-in for evaluator & hackathon demos
    try {
      await login("agent.vance@synvex.security", "VanceSecure2026!");
    } catch {
      await register("agent.vance@synvex.security", "VanceSecure2026!", "Agent Vance");
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, quickDemoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

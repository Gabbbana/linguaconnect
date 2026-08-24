import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import * as api from '../api/client';
import type { ApiUser } from '../api/client';

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
    nativeLanguage: string;
    city?: string;
  }) => Promise<void>;
  logOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'linguaconnect.auth';

function loadStored(): { token: string; user: ApiUser } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadStored();
  const [user, setUser] = useState<ApiUser | null>(stored?.user ?? null);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function persist(next: { token: string; user: ApiUser }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setToken(next.token);
    setUser(next.user);
  }

  async function logIn(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await api.login({ email, password });
      persist(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Log in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(input: {
    email: string;
    password: string;
    name: string;
    nativeLanguage: string;
    city?: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const result = await api.signup(input);
      persist(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logOut() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, error, logIn, signUp, logOut, clearError: () => setError(null) }),
    [user, token, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

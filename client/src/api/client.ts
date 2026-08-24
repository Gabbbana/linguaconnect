const API_URL = import.meta.env.VITE_API_URL as string;

export interface ApiUser {
  id: number;
  email: string;
  name: string;
  nativeLanguage: string;
  city: string | null;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export function signup(input: {
  email: string;
  password: string;
  name: string;
  nativeLanguage: string;
  city?: string;
}) {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchPresenceSummary() {
  return request<{ activeNow: number }>('/api/presence-summary');
}

export function fetchLanguages() {
  return request<{
    languages: { code: string; name: string; bg: string; fg: string; online: number }[];
    nativeLanguages: string[];
  }>('/api/languages');
}

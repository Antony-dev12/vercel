import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true,
});

export const authApi = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

export const userApi = {
  updateProfile: (data: any) => api.put('/api/user/profile', data),
};

// ── Score types ──────────────────────────────────────────────────────────────

export interface ScorePayload {
  profileComplete: number;
  postFreq: number;
  engagement: number;
  responsiveness: number;
  platforms: string[];
  businessName?: string;
  sector?: string;
  location?: string;
  language?: string;
  source?: string;
}

export interface RecResult {
  icon: string;
  priority: 'high' | 'mid' | 'low';
  title: string;
  desc: string;
}

export interface ScoreResult {
  id: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  profileComplete: number;
  postFreq: number;
  engagement: number;
  responsiveness: number;
  platforms: string[];
  platformCount?: number;
  recs: RecResult[];
  businessName?: string;
  sector?: string;
  location?: string;
  source?: string;
  date: string;
  timestamp: number;
}

// ── Score API ─────────────────────────────────────────────────────────────────

export const scoreApi = {
  calculate: (data: ScorePayload) =>
    api.post<ScoreResult>('/api/score', { ...data, source: data.source ?? 'manual' }),

  history: (lang = 'en') =>
    api.get<ScoreResult[]>(`/api/history?lang=${lang}`),
};

export default api;

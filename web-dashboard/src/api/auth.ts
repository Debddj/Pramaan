import axios from 'axios';
import { OfficerSession } from './types';

const TOKEN_KEY = 'pramaan_jwt_token';
const SESSION_KEY = 'pramaan_officer_session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getOfficerSession = (): OfficerSession | null => {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setOfficerSession = (session: OfficerSession) => {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

export const loginOfficer = async (email: string, password: string): Promise<OfficerSession> => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
  const data = res.data;
  const session: OfficerSession = {
    token: data.access_token,
    email: email,
    name: data.name || (email.includes('officer') ? 'Inspector R. Sharma' : 'Authorized Officer'),
    badge_number: data.badge_number || 'DL-LM-4821',
    role: data.role || 'officer',
  };
  setOfficerSession(session);
  return session;
};

export const ensureDefaultAuth = async (): Promise<OfficerSession> => {
  const existing = getOfficerSession();
  if (existing && existing.token) {
    return existing;
  }
  try {
    return await loginOfficer('officer@consumer.gov.in', 'sih2026');
  } catch (err) {
    // If backend is offline, return fallback session structure for UI hydration
    const offlineSession: OfficerSession = {
      token: 'demo-offline-token',
      email: 'officer@consumer.gov.in',
      name: 'Inspector R. Sharma',
      badge_number: 'DL-LM-4821',
      role: 'officer',
    };
    return offlineSession;
  }
};

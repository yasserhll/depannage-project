export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export const API_URL      = `${API_BASE_URL}/api`;

export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept:         'application/json',
};

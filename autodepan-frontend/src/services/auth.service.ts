import { api } from '@/lib/fetcher';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types/auth.types';

export const authService = {
  login(credentials: LoginCredentials) {
    return api.post<AuthResponse>('/auth/login', credentials);
  },
  register(data: RegisterData) {
    return api.post<AuthResponse>('/auth/register', { ...data, role: 'client' });
  },
  registerDepanneur(data: RegisterData) {
    return api.post<AuthResponse>('/auth/register', { ...data, role: 'depanneur' });
  },
  logout() {
    return api.post<void>('/auth/logout', {});
  },
  getMe() {
    return api.get<{ user: import('@/types/auth.types').User }>('/auth/me');
  },
  updateProfile(data: { name?: string; locale?: string }) {
    return api.patch<{ user: import('@/types/auth.types').User }>('/auth/profile', data);
  },
  sendPhoneCode(phone: string) {
    return api.post<{ message: string }>('/auth/phone/send', { phone });
  },
  verifyPhoneCode(phone: string, code: string) {
    return api.post<{ message: string }>('/auth/phone/verify', { phone, code });
  },
  forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },
  resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }) {
    return api.post<{ message: string }>('/auth/reset-password', data);
  },
  updateFcmToken(token: string, platform: 'android' | 'ios' | 'web') {
    return api.post<{ message: string }>('/auth/fcm-token', { token, platform });
  },
};

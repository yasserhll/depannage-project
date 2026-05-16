export type UserRole   = 'client' | 'depanneur' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'banned';

export interface DepanneurProfileSummary {
  id:               number;
  business_name:    string | null;
  is_available:     boolean;
  is_kyc_verified:  boolean;
  kyc_status:       string;
  vehicle_type:     string | null;
  vehicle_model:    string | null;
  rating_avg:       number | string;
  rating_count:     number;
  total_missions:   number;
  current_lat:      number | null;
  current_lng:      number | null;
}

export interface User {
  id:                  number;
  name:                string;
  email:               string | null;
  phone:               string | null;
  phone_verified_at:   string | null;
  email_verified_at:   string | null;
  avatar:              string | null;
  role:                UserRole;
  status:              UserStatus;
  locale:              string;
  last_lat:            number | null;
  last_lng:            number | null;
  last_seen_at:        string | null;
  created_at:          string;
  depanneur_profile?:  DepanneurProfileSummary | null;
}

export interface AuthState {
  user:      User | null;
  token:     string | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  login:    string;  // email ou téléphone
  password: string;
}

export interface RegisterData {
  name:                  string;
  email?:                string;
  phone?:                string;
  password:              string;
  password_confirmation: string;
  role?:                 'client' | 'depanneur';
}

export interface AuthResponse {
  user:    User;
  token:   string;
  message?: string;
}

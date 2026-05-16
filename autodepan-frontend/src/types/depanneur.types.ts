export type KYCStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface DepanneurProfile {
  id:                  number;
  user_id:             number;
  business_name:       string | null;
  description:         string | null;
  specializations:     string[];
  service_radius_km:   number;
  is_available:        boolean;
  is_kyc_verified:     boolean;
  kyc_status:          KYCStatus;
  vehicle_type:        string | null;
  vehicle_plate:       string | null;
  vehicle_model:       string | null;
  rating_avg:          number;
  rating_count:        number;
  total_missions:      number;
  current_lat:         number | null;
  current_lng:         number | null;
  location_updated_at: string | null;
}

export interface DepanneurSummary {
  id:          number;
  name:        string;
  avatar:      string | null;
  phone:       string | null;
  rating_avg:  number;
  vehicle_type: string | null;
}

export interface NearbyDepanneur {
  user_id:         number;
  name:            string;
  avatar:          string | null;
  rating_avg:      number;
  distance_km:     number;
  eta_minutes:     number;
  current_lat:     number;
  current_lng:     number;
  specializations: string[];
  vehicle_type:    string | null;
}

export interface Wallet {
  id:              number;
  balance:         number;
  pending_balance: number;
  total_earned:    number;
  total_withdrawn: number;
  currency:        string;
}

export interface WalletTransaction {
  id:            number;
  type:          'credit' | 'debit' | 'pending' | 'release' | 'withdrawal';
  amount:        number;
  balance_after: number;
  description:   string | null;
  created_at:    string;
}

export interface Document {
  id:               number;
  type:             string;
  file_path:        string;
  status:           'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  expires_at:       string | null;
  created_at:       string;
}

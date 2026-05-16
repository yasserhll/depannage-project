export type MissionStatus =
  | 'searching'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Mission {
  id:                     number;
  uuid:                   string;
  client_id:              number;
  depanneur_id:           number | null;
  status:                 MissionStatus;
  client_lat:             number;
  client_lng:             number;
  client_address:         string | null;
  breakdown_type:         string;
  breakdown_details:      string | null;
  vehicle_brand:          string | null;
  vehicle_model:          string | null;
  vehicle_year:           number | null;
  vehicle_plate:          string | null;
  estimated_price:        number | null;
  final_price:            number | null;
  platform_fee:           number | null;
  depanneur_amount:       number | null;
  currency:               string;
  distance_km:            number | null;
  estimated_duration_min: number | null;
  accepted_at:            string | null;
  arrived_at:             string | null;
  started_at:             string | null;
  completed_at:           string | null;
  cancelled_at:           string | null;
  auto_validate_at:       string | null;
  client_notes:           string | null;
  created_at:             string;
  client?:                import('./user.types').UserSummary;
  depanneur?:             import('./depanneur.types').DepanneurSummary;
  photos?:                MissionPhoto[];
  payment?:               { status: string } | null;
  dispute?:               { id: number; status: string } | null;
}

export interface MissionPhoto {
  id:          number;
  mission_id:  number;
  uploaded_by: number;
  file_path:   string;
  type:        'before' | 'during' | 'after' | 'document';
  created_at:  string;
}

export interface CreateMissionPayload {
  client_lat:        number;
  client_lng:        number;
  client_address?:   string;
  breakdown_type:    string;
  breakdown_details?: string;
  vehicle_brand?:    string;
  vehicle_model?:    string;
  vehicle_year?:     number;
  vehicle_plate?:    string;
  client_notes?:     string;
}

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  searching:   'Recherche en cours',
  accepted:    'Dépanneur trouvé',
  en_route:    'En chemin',
  arrived:     'Sur place',
  in_progress: 'Intervention en cours',
  completed:   'Terminée',
  cancelled:   'Annulée',
  disputed:    'En litige',
};

export const MISSION_STATUS_COLORS: Record<MissionStatus, string> = {
  searching:   'text-orange-400',
  accepted:    'text-blue-400',
  en_route:    'text-sky-400',
  arrived:     'text-green-400',
  in_progress: 'text-yellow-400',
  completed:   'text-green-500',
  cancelled:   'text-red-400',
  disputed:    'text-red-500',
};

export const BREAKDOWN_TYPES = [
  'Panne de batterie',
  'Crevaison / pneu à plat',
  'Panne de carburant',
  'Surchauffe moteur',
  'Clé perdue / verrouillage',
  'Accident / collision',
  'Panne électrique',
  'Problème de démarrage',
  'Fuite de liquide',
  'Autre panne mécanique',
] as const;

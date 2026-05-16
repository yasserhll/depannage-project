export interface UserSummary {
  id:     number;
  name:   string;
  avatar: string | null;
  phone:  string | null;
}

export interface Review {
  id:            number;
  mission_id:    number;
  reviewer_id:   number;
  reviewee_id:   number;
  reviewer_type: 'client' | 'depanneur';
  rating:        number;
  comment:       string | null;
  created_at:    string;
  reviewer?:     UserSummary;
}

export interface Notification {
  id:         string;
  type:       string;
  data:       Record<string, unknown>;
  read_at:    string | null;
  created_at: string;
}

export interface ChatMessage {
  id:         number;
  mission_id: number;
  sender_id:  number;
  type:       'text' | 'image' | 'location' | 'system';
  content:    string | null;
  file_path:  string | null;
  file_url:   string | null;
  lat:        number | null;
  lng:        number | null;
  read_at:    string | null;
  created_at: string;
  sender?:    UserSummary;
}

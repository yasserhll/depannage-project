export interface GPSPosition {
  lat:       number;
  lng:       number;
  accuracy?: number;
  speed?:    number;
  heading?:  number;
  timestamp: number;
}

export interface RouteData {
  distance_km:      number;
  duration_minutes: number;
  geometry:         [number, number][];
}

export interface GPSUpdate {
  mission_uuid: string;
  user_id:      number;
  lat:          number;
  lng:          number;
  accuracy?:    number;
  speed?:       number;
  heading?:     number;
  timestamp?:   number;
}

export interface TrackingData {
  depanneur_lat:          number;
  depanneur_lng:          number;
  distance_km:            number | null;
  estimated_duration_min: number | null;
  route:                  [number, number][] | null;
}

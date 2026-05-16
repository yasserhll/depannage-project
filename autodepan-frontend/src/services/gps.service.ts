import { api } from '@/lib/fetcher';

interface GeocodeResult {
  lat:         string;
  lon:         string;
  display_name: string;
  address?:    Record<string, string>;
}

interface RouteResult {
  distance_km:     number;
  duration_min:    number;
  geometry:        [number, number][];
}

export const gpsService = {
  updatePosition(lat: number, lng: number, missionUuid?: string, extras?: { accuracy?: number; speed?: number; heading?: number }) {
    return api.post<{ ok: boolean }>('/depanneur/gps/update', {
      lat,
      lng,
      mission_uuid: missionUuid,
      ...extras,
    });
  },

  getNearby(lat: number, lng: number, radiusKm = 50) {
    return api.get('/gps/nearby', { lat, lng, radius_km: radiusKm });
  },

  getRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
    return api.get<{ route: RouteResult }>('/gps/route', {
      from_lat: fromLat,
      from_lng: fromLng,
      to_lat:   toLat,
      to_lng:   toLng,
    });
  },

  geocode(query: string) {
    return api.get<{ results: GeocodeResult[] }>('/gps/geocode', { q: query });
  },

  reverseGeocode(lat: number, lng: number) {
    return api.get<{ result: GeocodeResult }>('/gps/reverse', { lat, lng });
  },
};

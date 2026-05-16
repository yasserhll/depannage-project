import { api } from '@/lib/fetcher';
import type { Mission, CreateMissionPayload } from '@/types/mission.types';
import type { NearbyDepanneur } from '@/types/depanneur.types';

interface PaginatedResponse<T> {
  missions:    T[];
  pagination:  { current_page: number; last_page: number; total: number };
}

interface MissionResponse     { message: string; mission: Mission }
interface TrackingResponse    { depanneur: object | null; mission_status: string; distance_km: number | null; estimated_duration_min: number | null }

export const missionService = {
  // ── Client ──────────────────────────────────────────────────────────────
  getNearbyDepanneurs(lat: number, lng: number, radius = 50) {
    return api.get<{ depanneurs: NearbyDepanneur[] }>('/gps/nearby', { lat, lng, radius_km: radius });
  },
  createMission(payload: CreateMissionPayload) {
    return api.post<MissionResponse>('/client/missions', payload);
  },
  getClientMissions(page = 1) {
    return api.get<PaginatedResponse<Mission>>('/client/missions', { page });
  },
  getClientMission(uuid: string) {
    return api.get<{ mission: Mission }>(`/client/missions/${uuid}`);
  },
  cancelMission(uuid: string, reason?: string) {
    return api.post<{ message: string }>(`/client/missions/${uuid}/cancel`, { reason });
  },
  validateMission(uuid: string) {
    return api.post<{ message: string }>(`/client/missions/${uuid}/validate`, {});
  },
  openDispute(uuid: string, reason: string) {
    return api.post<{ message: string }>(`/client/missions/${uuid}/dispute`, { reason });
  },
  uploadMissionPhotos(uuid: string, photos: File[], type: 'before' | 'after' | 'damage' = 'before') {
    const form = new FormData();
    photos.forEach((p, i) => form.append(`photos[${i}]`, p));
    form.append('type', type);
    return api.post<{ message: string }>(`/client/missions/${uuid}/photos`, form);
  },
  getMissionTracking(uuid: string) {
    return api.get<TrackingResponse>(`/client/missions/${uuid}/tracking`);
  },

  // ── Dépanneur ────────────────────────────────────────────────────────────
  getDepanneurPendingMissions() {
    return api.get<{ missions: Mission[] }>('/depanneur/missions/pending');
  },
  getDepanneurNearbyMissions(radius = 3) {
    return api.get<{ missions: Mission[]; gps_available: boolean; depanneur_lat?: number; depanneur_lng?: number }>(
      '/depanneur/missions/nearby',
      { radius },
    );
  },
  getDepanneurMissions(page = 1) {
    return api.get<PaginatedResponse<Mission>>('/depanneur/missions', { page });
  },
  getDepanneurMission(uuid: string) {
    return api.get<{ mission: Mission }>(`/depanneur/missions/${uuid}`);
  },
  acceptMission(uuid: string) {
    return api.post<MissionResponse>(`/depanneur/missions/${uuid}/accept`, {});
  },
  signalArrival(uuid: string) {
    return api.post<{ message: string }>(`/depanneur/missions/${uuid}/arrive`, {});
  },
  startMission(uuid: string) {
    return api.post<{ message: string }>(`/depanneur/missions/${uuid}/start`, {});
  },
  completeMission(uuid: string, notes?: string) {
    return api.post<{ message: string }>(`/depanneur/missions/${uuid}/complete`, { notes });
  },
};

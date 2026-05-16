export const OSM_TILE_URL  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '© <a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a> contributors';

export const OSRM_BASE_URL      = import.meta.env.VITE_OSRM_URL ?? 'https://router.project-osrm.org';
export const NOMINATIM_BASE_URL = import.meta.env.VITE_NOMINATIM_URL ?? 'https://nominatim.openstreetmap.org';

export const DEFAULT_MAP_CENTER: [number, number] = [36.7538, 3.0588]; // Alger
export const DEFAULT_MAP_ZOOM   = 13;
export const TRACKING_MAP_ZOOM  = 15;

// Distance minimale (mètres) avant de re-broadcaster la position
export const GPS_MIN_DISTANCE_METERS = 10;
// Intervalle minimum entre deux updates GPS (ms)
export const GPS_MIN_INTERVAL_MS     = 3000;

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { setMyPosition } from '@/store/slices/gpsSlice';
import { api } from '@/lib/fetcher';
import { haversineDistance } from '@/lib/utils';
import { GPS_MIN_DISTANCE_METERS, GPS_MIN_INTERVAL_MS } from '@/config/maps';
import type { GPSPosition } from '@/types/gps.types';

export function useDepanneurGPS(missionId: string | null) {
  const dispatch      = useAppDispatch();
  const watchIdRef    = useRef<number | null>(null);
  const lastPosRef    = useRef<GPSPosition | null>(null);
  const lastSentAtRef = useRef<number>(0);

  const broadcast = useCallback((pos: GPSPosition) => {
    if (!missionId) return;

    const now      = Date.now();
    const lastPos  = lastPosRef.current;
    const elapsed  = now - lastSentAtRef.current;

    // Throttle : min 3s entre broadcasts ET min 10m de déplacement
    if (elapsed < GPS_MIN_INTERVAL_MS) return;
    if (lastPos) {
      const dist = haversineDistance(lastPos.lat, lastPos.lng, pos.lat, pos.lng) * 1000;
      if (dist < GPS_MIN_DISTANCE_METERS) return;
    }

    api.post('/gps/update', {
      mission_uuid: missionId,
      lat:          pos.lat,
      lng:          pos.lng,
      accuracy:     pos.accuracy,
      speed:        pos.speed,
      heading:      pos.heading,
    }).catch(() => {});

    lastPosRef.current    = pos;
    lastSentAtRef.current = now;
  }, [missionId, emit]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (raw) => {
        const pos: GPSPosition = {
          lat:       raw.coords.latitude,
          lng:       raw.coords.longitude,
          accuracy:  raw.coords.accuracy,
          speed:     raw.coords.speed ?? undefined,
          heading:   raw.coords.heading ?? undefined,
          timestamp: raw.timestamp,
        };
        dispatch(setMyPosition(pos));
        broadcast(pos);
      },
      (err) => console.error('[GPS]', err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  }, [dispatch, broadcast]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (missionId) {
      startTracking();
    } else {
      stopTracking();
    }
    return stopTracking;
  }, [missionId, startTracking, stopTracking]);

  return { startTracking, stopTracking };
}

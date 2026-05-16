import { useState, useCallback, useRef } from 'react';
import type { GPSPosition } from '@/types/gps.types';

interface GeolocationState {
  position:     GPSPosition | null;
  error:        string | null;
  isWatching:   boolean;
  startWatch:   () => void;
  stopWatch:    () => void;
  getOnce:      () => Promise<GPSPosition>;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout:            10000,
  maximumAge:         0,
};

export function useGeolocation(): GeolocationState {
  const [position,   setPosition]   = useState<GPSPosition | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setError(null);
    setPosition({
      lat:       pos.coords.latitude,
      lng:       pos.coords.longitude,
      accuracy:  pos.coords.accuracy,
      speed:     pos.coords.speed ?? undefined,
      heading:   pos.coords.heading ?? undefined,
      timestamp: pos.timestamp,
    });
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const messages: Record<number, string> = {
      1: 'Permission de géolocalisation refusée.',
      2: 'Position non disponible.',
      3: 'Délai de géolocalisation dépassé.',
    };
    setError(messages[err.code] ?? 'Erreur de géolocalisation inconnue.');
  }, []);

  const startWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur.');
      return;
    }
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      GEO_OPTIONS,
    );
    setIsWatching(true);
  }, [handleSuccess, handleError]);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
    }
  }, []);

  const getOnce = useCallback((): Promise<GPSPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsPos: GPSPosition = {
            lat:       pos.coords.latitude,
            lng:       pos.coords.longitude,
            accuracy:  pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          setPosition(gpsPos);
          resolve(gpsPos);
        },
        (err) => reject(new Error(err.message)),
        GEO_OPTIONS,
      );
    });
  }, []);

  return { position, error, isWatching, startWatch, stopWatch, getOnce };
}

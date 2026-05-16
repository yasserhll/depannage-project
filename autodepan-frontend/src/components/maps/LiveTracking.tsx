import { useEffect, useRef, useState } from 'react';
import { Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '@/hooks/useSocket';
import { clientIcon, depanneurIcon } from './icons';
import { MapContainer } from './MapContainer';
import type { TrackingData, GPSUpdate } from '@/types/gps.types';

interface LiveTrackingProps {
  missionUuid:         string;
  clientPosition:      [number, number];
  initialTrackingData: TrackingData;
}

function AnimatedDepanneurMarker({ position }: { position: [number, number] }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    markerRef.current?.setLatLng(position);
  }, [position]);

  return <Marker ref={markerRef} position={position} icon={depanneurIcon} />;
}

function AutoFitBounds({
  clientPos,
  depanneurPos,
}: {
  clientPos:    [number, number];
  depanneurPos: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([clientPos, depanneurPos]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  }, [map, clientPos, depanneurPos]);

  return null;
}

export function LiveTracking({ missionUuid, clientPosition, initialTrackingData }: LiveTrackingProps) {
  const { on }          = useSocket();
  const [tracking, setTracking] = useState<TrackingData>(initialTrackingData);

  // Écoute les mises à jour GPS en temps réel via Reverb (canal privé mission)
  useEffect(() => {
    const off = on<{ depanneur_lat: number; depanneur_lng: number; eta_minutes?: number; distance_km?: number; route?: [number, number][] }>(
      'gps.updated',
      (data) => {
        setTracking((prev) => ({
          depanneur_lat:          data.depanneur_lat,
          depanneur_lng:          data.depanneur_lng,
          distance_km:            data.distance_km ?? prev.distance_km,
          estimated_duration_min: data.eta_minutes ?? prev.estimated_duration_min,
          route:                  data.route ?? prev.route,
        }));
      },
      `mission.${missionUuid}`,
      true,
    );
    return off;
  }, [missionUuid, on]);

  const depanneurPos: [number, number] = [tracking.depanneur_lat, tracking.depanneur_lng];

  return (
    <div className="relative w-full h-full">
      <MapContainer>
        <AutoFitBounds clientPos={clientPosition} depanneurPos={depanneurPos} />
        <Marker position={clientPosition} icon={clientIcon} />
        <AnimatedDepanneurMarker position={depanneurPos} />
        {tracking.route && tracking.route.length > 0 && (
          <Polyline
            positions={tracking.route}
            pathOptions={{ color: '#f97316', weight: 5, opacity: 0.85, dashArray: '8, 4' }}
          />
        )}
      </MapContainer>

      {/* ETA Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10
                      bg-slate-900/95 backdrop-blur-sm border border-brand-border
                      rounded-2xl px-6 py-3 text-center shadow-card min-w-[160px]">
        {tracking.estimated_duration_min !== null ? (
          <>
            <p className="text-brand-muted text-xs mb-0.5">Arrivée estimée</p>
            <p className="text-3xl font-black text-orange-400">
              {tracking.estimated_duration_min}
              <span className="text-lg font-semibold"> min</span>
            </p>
            {tracking.distance_km !== null && (
              <p className="text-brand-muted text-xs mt-0.5">
                {tracking.distance_km} km restants
              </p>
            )}
          </>
        ) : (
          <p className="text-brand-muted text-sm">Calcul en cours…</p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Marker } from 'react-leaflet';
import { AlertTriangle, Wrench, Star, Clock, AlertCircle } from 'lucide-react';
import { MapContainer } from '@/components/maps/MapContainer';
import { clientIcon, depanneurIcon } from '@/components/maps/icons';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { missionService } from '@/services/mission.service';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import type { NearbyDepanneur } from '@/types/depanneur.types';

export function ClientDashboard() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const { position, getOnce, error: gpsError } = useGeolocation();
  const [locating, setLocating] = useState(false);

  // Localisation au montage
  useEffect(() => {
    setLocating(true);
    getOnce().finally(() => setLocating(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dépanneurs proches
  const { data: nearbyData, isLoading: loadingNearby } = useQuery({
    queryKey: ['nearby-depanneurs', position?.lat, position?.lng],
    queryFn:  () => missionService.getNearbyDepanneurs(position!.lat, position!.lng),
    enabled:  !!position,
    refetchInterval: 30_000,
  });

  const nearby: NearbyDepanneur[] = nearbyData?.depanneurs ?? [];
  const mapCenter: [number, number] = position
    ? [position.lat, position.lng]
    : [36.7538, 3.0588];

  return (
    <div className="relative h-[calc(100vh-7rem)]">
      {/* Carte plein écran */}
      <div className="absolute inset-0">
        <MapContainer center={mapCenter} zoom={14}>
          {position && (
            <Marker position={[position.lat, position.lng]} icon={clientIcon} />
          )}
          {nearby.map((dep) => (
            <Marker
              key={dep.user_id}
              position={[dep.current_lat, dep.current_lng]}
              icon={depanneurIcon}
            />
          ))}
        </MapContainer>
      </div>

      {/* Overlay haut */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-surface/95 backdrop-blur-sm border border-brand-border rounded-2xl p-4 shadow-card">
          <p className="text-brand-muted text-xs mb-1">Bonjour</p>
          <p className="text-brand-text font-bold">{user?.name}</p>

          {locating && (
            <div className="flex items-center gap-2 mt-2">
              <Spinner size="sm" />
              <span className="text-brand-muted text-xs">Localisation en cours…</span>
            </div>
          )}

          {!locating && position && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400 text-xs font-medium">Position détectée</span>
              {!loadingNearby && (
                <span className="text-brand-muted text-xs">· {nearby.length} dépanneur{nearby.length > 1 ? 's' : ''} à proximité</span>
              )}
            </div>
          )}

          {gpsError && (
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {gpsError}
            </p>
          )}
        </div>
      </div>

      {/* Overlay bas — bouton principal */}
      <div className="absolute bottom-4 left-4 right-4 z-10 space-y-3">
        {/* Liste dépanneurs proches */}
        {nearby.length > 0 && (
          <div className="bg-surface/95 backdrop-blur-sm border border-brand-border rounded-2xl p-3 shadow-card">
            <p className="text-brand-muted text-xs font-medium mb-2 px-1">
              Dépanneurs disponibles à proximité
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {nearby.slice(0, 5).map((dep) => (
                <NearbyCard key={dep.user_id} dep={dep} />
              ))}
            </div>
          </div>
        )}

        {/* CTA principal */}
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/client/nouveau')}
          disabled={!position}
          className="shadow-glow-orange text-base"
        >
          <AlertCircle className="w-5 h-5 inline mr-2" /> Demander un dépannage
        </Button>
      </div>
    </div>
  );
}

function NearbyCard({ dep }: { dep: NearbyDepanneur }) {
  return (
    <div className="flex-shrink-0 bg-surface-raised border border-brand-border rounded-xl p-3 w-36">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
          <Wrench className="w-4 h-4 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-brand-text text-xs font-semibold truncate">{dep.name}</p>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-brand-muted text-[10px]">{dep.rating_avg.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className={cn('text-[10px] font-semibold flex items-center gap-0.5', dep.eta_minutes <= 5 ? 'text-green-400' : 'text-orange-400')}>
        <Clock className="w-3 h-3" /> {dep.eta_minutes} min · {dep.distance_km.toFixed(1)} km
      </div>
    </div>
  );
}

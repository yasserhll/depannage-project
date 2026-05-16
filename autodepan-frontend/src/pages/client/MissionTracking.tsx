import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Clock, Wrench, Phone, Star, MessageCircle } from 'lucide-react';
import { LiveTracking } from '@/components/maps/LiveTracking';
import { MissionBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { missionService } from '@/services/mission.service';
import { useSocket } from '@/hooks/useSocket';
import type { Mission } from '@/types/mission.types';

export function MissionTracking() {
  const { uuid }  = useParams<{ uuid: string }>();
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const { on }    = useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['mission', uuid],
    queryFn:  () => missionService.getClientMission(uuid!),
    enabled:  !!uuid,
    refetchInterval: 10_000,
  });

  const mission: Mission | undefined = data?.mission;

  const { data: trackingData } = useQuery({
    queryKey: ['tracking', uuid],
    queryFn:  () => missionService.getMissionTracking(uuid!),
    enabled:  !!mission && ['accepted', 'en_route', 'arrived'].includes(mission.status),
    refetchInterval: 5_000,
  });

  // Mise à jour temps réel du statut via WebSocket
  useEffect(() => {
    if (!uuid) return;
    const off = on<{ status: Mission['status'] }>('mission.status_changed', ({ status }) => {
      qc.setQueryData(['mission', uuid], (old: typeof data) =>
        old ? { ...old, mission: { ...old.mission!, status } } : old,
      );
      if (status === 'completed') {
        qc.invalidateQueries({ queryKey: ['mission', uuid] });
      }
    });
    return off;
  }, [uuid, on, qc]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="p-6 text-center">
        <p className="text-brand-muted">Mission introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/client/missions')} className="mt-4">
          Mes missions
        </Button>
      </div>
    );
  }

  const clientPos: [number, number] = [Number(mission.client_lat), Number(mission.client_lng)];

  const depanneur = trackingData as { depanneur: { name: string; phone?: string; current_lat?: number; current_lng?: number; rating_avg?: number } | null } | undefined;

  return (
    <div className="h-screen flex flex-col">
      {/* Header flottant */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pb-2">
        <div className="bg-surface/95 backdrop-blur-sm border border-brand-border rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <MissionBadge status={mission.status} />
            <Link to={`/client/chat/${mission.uuid}`} className="text-primary text-sm font-medium flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Chat
            </Link>
          </div>

          <p className="text-brand-text font-semibold text-sm">{mission.breakdown_type}</p>

          {depanneur?.depanneur && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-brand-border">
              <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-brand-text text-xs font-medium">{depanneur.depanneur.name}</p>
                {depanneur.depanneur.phone && (
                  <a href={`tel:${depanneur.depanneur.phone}`} className="text-primary text-xs flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Appeler
                  </a>
                )}
                {depanneur.depanneur.rating_avg && (
                  <span className="text-yellow-400 text-xs ml-2 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400" /> {Number(depanneur.depanneur.rating_avg).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carte plein écran */}
      <div className="flex-1">
        {depanneur?.depanneur?.current_lat && depanneur.depanneur.current_lng ? (
          <LiveTracking
            missionUuid={mission.uuid}
            clientPosition={clientPos}
            initialTrackingData={{
              depanneur_lat:         depanneur.depanneur.current_lat,
              depanneur_lng:         depanneur.depanneur.current_lng,
              distance_km:           mission.distance_km ?? null,
              estimated_duration_min: mission.estimated_duration_min ?? null,
              route:                 null,
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-brand-bg gap-4">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 bg-primary/20 rounded-full animate-ping-slow absolute inset-0" />
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                {mission.status === 'searching'
                  ? <Search className="w-8 h-8 text-primary" />
                  : <Clock className="w-8 h-8 text-primary" />
                }
              </div>
            </div>
            <div className="text-center px-8">
              <p className="text-brand-text font-bold">
                {mission.status === 'searching' ? 'Recherche en cours' : 'En attente du dépanneur'}
              </p>
              <p className="text-brand-muted text-sm mt-1">
                {mission.status === 'searching'
                  ? 'Nous cherchons un dépanneur à proximité…'
                  : 'Le dépanneur se prépare à partir…'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions bas */}
      {mission.status === 'completed' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-sm border-t border-brand-border">
          <p className="text-brand-muted text-sm text-center mb-3">
            La mission est terminée. Validez-la pour libérer le paiement.
          </p>
          <Button fullWidth onClick={() => navigate(`/client/missions/${mission.uuid}`)}>
            Voir le récapitulatif
          </Button>
        </div>
      )}
    </div>
  );
}

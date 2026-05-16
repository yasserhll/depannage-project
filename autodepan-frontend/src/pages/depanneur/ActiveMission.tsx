import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Marker } from 'react-leaflet';
import { Car, MapPin, Wrench, Check, CheckCircle, MessageCircle } from 'lucide-react';
import { MapContainer } from '@/components/maps/MapContainer';
import { clientIcon, depanneurIcon } from '@/components/maps/icons';
import { Button } from '@/components/common/Button';
import { MissionBadge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { useDepanneurGPS } from '@/hooks/useDepanneurGPS';
import { missionService } from '@/services/mission.service';
import { useAppSelector } from '@/store';
import { formatCurrency } from '@/lib/utils';
import toast from '@/lib/toast';
import type React from 'react';

export function ActiveMission() {
  const { uuid }   = useParams<{ uuid: string }>();
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const myPos      = useAppSelector((s) => s.gps.myPosition);

  const { data, isLoading } = useQuery({
    queryKey: ['dep-mission', uuid],
    queryFn:  () => missionService.getDepanneurMission(uuid!),
    enabled:  !!uuid,
    refetchInterval: 10_000,
  });

  const mission = data?.mission;

  // GPS actif pendant la mission
  useDepanneurGPS(
    mission && ['accepted', 'en_route', 'arrived', 'in_progress'].includes(mission.status)
      ? mission.uuid
      : null,
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: ['dep-mission', uuid] });

  const { mutate: signalRoute,    isPending: goingRoute   } = useMutation({ mutationFn: () => missionService.signalArrival(uuid!),  onSuccess: invalidate, onError: () => toast.error('Erreur') });
  const { mutate: signalArrival,  isPending: arriving     } = useMutation({ mutationFn: () => missionService.signalArrival(uuid!),  onSuccess: invalidate, onError: () => toast.error('Erreur') });
  const { mutate: startWork,      isPending: starting     } = useMutation({ mutationFn: () => missionService.startMission(uuid!),   onSuccess: invalidate, onError: () => toast.error('Erreur') });
  const { mutate: completeWork,   isPending: completing   } = useMutation({
    mutationFn: () => missionService.completeMission(uuid!),
    onSuccess:  () => { toast.success('Mission terminée !'); navigate('/depanneur/missions'); },
  });

  type StatusAction = {
    label: React.ReactNode;
    onAction: () => void;
    loading: boolean;
    variant?: 'primary' | 'secondary';
  };

  const statusActions: Partial<Record<string, StatusAction>> = {
    accepted:    {
      label: <><Car className="w-4 h-4 inline mr-1" /> Je pars maintenant</>,
      onAction: signalRoute, loading: goingRoute, variant: 'secondary',
    },
    en_route:    {
      label: <><MapPin className="w-4 h-4 inline mr-1" /> Je suis arrivé sur place</>,
      onAction: signalArrival, loading: arriving,
    },
    arrived:     {
      label: <><Wrench className="w-4 h-4 inline mr-1" /> Démarrer l'intervention</>,
      onAction: startWork, loading: starting,
    },
    in_progress: {
      label: <><Check className="w-4 h-4 inline mr-1" /> Intervention terminée</>,
      onAction: completeWork, loading: completing,
    },
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!mission)  return <div className="p-6 text-center text-brand-muted">Mission introuvable.</div>;

  const clientPos: [number, number] = [Number(mission.client_lat), Number(mission.client_lng)];
  const depPos: [number, number] | null = myPos ? [myPos.lat, myPos.lng] : null;
  const mapCenter = depPos ?? clientPos;

  const action = statusActions[mission.status];

  return (
    <div className="h-screen flex flex-col">
      {/* Header flottant */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
        <div className="bg-surface/95 backdrop-blur-sm border border-brand-border rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <MissionBadge status={mission.status} />
            <Link to={`/depanneur/chat/${mission.uuid}`} className="text-blue-400 text-sm font-medium flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Chat
            </Link>
          </div>

          <p className="text-brand-text font-semibold text-sm">{mission.breakdown_type}</p>

          {mission.client_address && (
            <p className="text-brand-muted text-xs mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {mission.client_address}
            </p>
          )}

          {mission.estimated_price && (
            <p className="text-green-400 text-sm font-bold mt-1">
              Votre part : ~{formatCurrency(Number(mission.estimated_price) * 0.9)}
            </p>
          )}

          {mission.distance_km && (
            <p className="text-brand-muted text-xs mt-0.5">
              Distance : {mission.distance_km} km
              {mission.estimated_duration_min && ` · ~${mission.estimated_duration_min} min`}
            </p>
          )}
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1">
        <MapContainer center={mapCenter} zoom={15}>
          <Marker position={clientPos} icon={clientIcon} />
          {depPos && <Marker position={depPos} icon={depanneurIcon} />}
        </MapContainer>
      </div>

      {/* Action principale */}
      {action && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-sm border-t border-brand-border">
          <Button
            fullWidth
            size="lg"
            variant={action.variant ?? 'primary'}
            loading={action.loading}
            onClick={action.onAction}
          >
            {action.label}
          </Button>
        </div>
      )}

      {mission.status === 'completed' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-brand-border">
          <p className="text-brand-muted text-sm text-center mb-3 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            Mission terminée. En attente de validation du client.
          </p>
          <Button variant="ghost" fullWidth onClick={() => navigate('/depanneur')}>
            Retour au tableau de bord
          </Button>
        </div>
      )}
    </div>
  );
}

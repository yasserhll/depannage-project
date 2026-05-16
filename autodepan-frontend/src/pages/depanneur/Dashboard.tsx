import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Marker, Popup } from 'react-leaflet';
import {
  AlertCircle, Check, Circle, Star, ArrowRight,
  MapPin, Wrench, Clock, X, Navigation,
} from 'lucide-react';
import { MapContainer } from '@/components/maps/MapContainer';
import { depanneurIcon, clientMissionIcon } from '@/components/maps/icons';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Card, CardBody } from '@/components/common/Card';
import { MissionBadge } from '@/components/common/Badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/lib/fetcher';
import { missionService } from '@/services/mission.service';
import { formatCurrency } from '@/lib/utils';
import toast from '@/lib/toast';
import type { Mission } from '@/types/mission.types';

interface DashboardData {
  stats:            { missions_today: number; missions_completed: number; rating_avg: number; total_missions: number };
  wallet_balance:   number;
  is_available:     boolean;
  kyc_status:       string;
  is_kyc_verified:  boolean;
  pending_missions: Mission[];
}

export function DepanneurDashboard() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const { position, getOnce } = useGeolocation();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Récupérer la position GPS une fois au montage
  useEffect(() => { getOnce(); }, []); // eslint-disable-line

  // Envoyer la position GPS au backend dès qu'elle change
  useEffect(() => {
    if (!position) return;
    api.post('/depanneur/location', { lat: position.lat, lng: position.lng }).catch(() => {});
  }, [position]);

  // Données du dashboard
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['depanneur-dashboard'],
    queryFn:  () => api.get('/depanneur/dashboard'),
    refetchInterval: 30_000,
  });

  // Missions à proximité (polling toutes les 15s — remplace WebSocket)
  const { data: nearbyData, isLoading: loadingNearby } = useQuery({
    queryKey: ['depanneur-nearby-missions', position?.lat, position?.lng],
    queryFn:  () => missionService.getDepanneurNearbyMissions(3),
    enabled:  !!(data?.is_available && data?.is_kyc_verified),
    refetchInterval: 15_000,
  });

  const nearbyMissions: Mission[] = nearbyData?.missions ?? [];

  // Toggle disponibilité
  const { mutate: toggleAvailability, isPending: toggling } = useMutation({
    mutationFn: () => api.post('/depanneur/availability/toggle', {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['depanneur-dashboard'] }),
    onError:    () => toast.error('Impossible de changer le statut.'),
  });

  // Accepter une mission
  const { mutate: acceptMission, isPending: accepting } = useMutation({
    mutationFn: (uuid: string) => missionService.acceptMission(uuid),
    onSuccess: ({ mission }) => {
      toast.success('Mission acceptée !');
      setSelectedMission(null);
      qc.invalidateQueries({ queryKey: ['depanneur-nearby-missions'] });
      navigate(`/depanneur/missions/${mission.uuid}`);
    },
    onError: () => toast.error('Impossible d\'accepter cette mission.'),
  });

  const handleMissionClick = useCallback((mission: Mission) => {
    setSelectedMission(mission);
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
  }, []);

  const mapCenter: [number, number] = position ? [position.lat, position.lng] : [36.7538, 3.0588];
  const isAvailable   = data?.is_available ?? false;
  const isKycVerified = data?.is_kyc_verified ?? false;

  return (
    <div className="relative h-[calc(100vh-7rem)]">

      {/* Carte plein écran */}
      <div className="absolute inset-0">
        <MapContainer center={mapCenter} zoom={14}>
          {/* Marqueur du dépanneur */}
          {position && <Marker position={[position.lat, position.lng]} icon={depanneurIcon} />}

          {/* Marqueurs des clients en attente de dépannage */}
          {isAvailable && nearbyMissions.map((mission) => (
            <Marker
              key={mission.uuid}
              position={[mission.client_lat, mission.client_lng]}
              icon={clientMissionIcon}
              eventHandlers={{ click: () => handleMissionClick(mission) }}
            >
              <Popup>
                <div className="text-sm font-semibold text-gray-800 min-w-[140px]">
                  <p className="font-bold">{mission.breakdown_type}</p>
                  {mission.distance_km && (
                    <p className="text-orange-600">{mission.distance_km.toFixed(1)} km</p>
                  )}
                  <button
                    onClick={() => handleMissionClick(mission)}
                    className="mt-1 text-blue-600 underline text-xs"
                  >
                    Voir les détails
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Panneau supérieur — statut + stats */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-surface/95 backdrop-blur-sm border border-brand-border rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-text font-bold text-sm">Statut</p>
              <p className={`flex items-center gap-1 ${isAvailable ? 'text-green-400 text-xs' : 'text-brand-muted text-xs'}`}>
                <Circle className={`w-3 h-3 ${isAvailable ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
                {isAvailable ? 'Disponible' : 'Hors ligne'}
              </p>
            </div>

            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <button
                onClick={() => toggleAvailability()}
                disabled={toggling || !isKycVerified}
                className={`
                  relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0
                  ${isAvailable ? 'bg-green-500' : 'bg-surface-overlay'}
                  disabled:opacity-50
                `}
              >
                <span className={`
                  absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300
                  ${isAvailable ? 'left-7' : 'left-0.5'}
                `} />
              </button>
            )}
          </div>

          {!isLoading && !isKycVerified && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-amber-400 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Votre compte est en attente de validation KYC.
              </p>
              <button
                onClick={() => navigate('/depanneur/documents')}
                className="text-amber-400 text-xs underline mt-1 flex items-center gap-1"
              >
                Soumettre mes documents <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {data && (
            <div className="flex gap-4 mt-3 pt-3 border-t border-brand-border">
              <Stat label="Missions" value={data.stats.total_missions} />
              <Stat label="Note"     value={<span className="flex items-center gap-1">{data.stats.rating_avg.toFixed(1)} <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /></span>} />
              <Stat label="Wallet"   value={formatCurrency(data.wallet_balance)} />
            </div>
          )}
        </div>
      </div>

      {/* Bulle missions à proximité (coin bas gauche) */}
      {isAvailable && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-surface/95 backdrop-blur-sm border border-brand-border rounded-2xl px-3 py-2 shadow-card flex items-center gap-2">
            {loadingNearby ? (
              <Spinner size="sm" />
            ) : (
              <MapPin className="w-4 h-4 text-orange-400" />
            )}
            <span className="text-brand-text text-xs font-semibold">
              {loadingNearby
                ? 'Recherche…'
                : nearbyData?.gps_available === false
                  ? 'GPS requis'
                  : `${nearbyMissions.length} demande${nearbyMissions.length > 1 ? 's' : ''} à proximité`
              }
            </span>
            {!nearbyData?.gps_available && !loadingNearby && (
              <button
                onClick={() => getOnce()}
                className="text-blue-400 text-[10px] underline flex items-center gap-0.5"
              >
                <Navigation className="w-3 h-3" /> Activer GPS
              </button>
            )}
          </div>
        </div>
      )}

      {/* Popup détail mission sélectionnée */}
      {selectedMission && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end p-4">
          <Card className="w-full animate-slide-up">
            <CardBody>
              {/* En-tête */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-brand-text font-bold">Demande de dépannage</p>
                    <MissionBadge status={selectedMission.status} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMission(null)}
                  className="text-brand-muted hover:text-brand-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Détails */}
              <div className="space-y-2 mb-4">
                <Row label="Type de panne"  value={selectedMission.breakdown_type} />
                {selectedMission.breakdown_details && (
                  <Row label="Détails" value={selectedMission.breakdown_details} />
                )}
                {selectedMission.vehicle_brand && (
                  <Row
                    label="Véhicule"
                    value={`${selectedMission.vehicle_brand}${selectedMission.vehicle_model ? ' ' + selectedMission.vehicle_model : ''}${selectedMission.vehicle_year ? ' ('+selectedMission.vehicle_year+')' : ''}`}
                  />
                )}
                {selectedMission.vehicle_plate && (
                  <Row label="Plaque" value={selectedMission.vehicle_plate} />
                )}
                {selectedMission.distance_km != null && (
                  <Row
                    label="Distance"
                    value={`${Number(selectedMission.distance_km).toFixed(1)} km`}
                    valueColor="text-green-400"
                  />
                )}
                {selectedMission.estimated_price && (
                  <Row
                    label="Votre part estimée"
                    value={formatCurrency(selectedMission.estimated_price * 0.9)}
                    valueColor="text-orange-400"
                  />
                )}
                {selectedMission.client?.name && (
                  <Row label="Client" value={selectedMission.client.name} />
                )}
              </div>

              {/* ETA estimée */}
              {selectedMission.distance_km != null && (
                <div className="flex items-center gap-1.5 mb-4 text-brand-muted text-xs bg-surface-raised rounded-xl px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Temps estimé : <span className="text-brand-text font-medium">
                    ~{Math.ceil(Number(selectedMission.distance_km) * 3)} min
                  </span>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => setSelectedMission(null)}>
                  <X className="w-4 h-4 inline mr-1" /> Ignorer
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  loading={accepting}
                  onClick={() => acceptMission(selectedMission.uuid)}
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  <Wrench className="w-4 h-4 inline mr-1" /> Accepter la mission
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number | React.ReactNode }) {
  return (
    <div>
      <p className="text-brand-muted text-[10px]">{label}</p>
      <p className="text-brand-text font-bold text-sm">{value}</p>
    </div>
  );
}

function Row({ label, value, valueColor = 'text-brand-text' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-brand-muted text-sm">{label} :</span>
      <span className={`font-medium text-sm ${valueColor}`}>{value}</span>
    </div>
  );
}

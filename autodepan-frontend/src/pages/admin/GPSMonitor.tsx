import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { MapContainer } from '@/components/maps/MapContainer';
import { depanneurIcon } from '@/components/maps/icons';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/store';
import { Card, CardBody } from '@/components/common/Card';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface LiveDepanneur {
  mission_uuid:    string;
  depanneur_lat:   number;
  depanneur_lng:   number;
  eta_minutes?:    number;
  distance_km?:    number;
  depanneur_id?:   number;
  depanneur_name?: string;
}

const STATUS_ICON = {
  connected:    <Wifi size={14} className="text-green-400" />,
  connecting:   <Loader2 size={14} className="text-yellow-400 animate-spin" />,
  disconnected: <WifiOff size={14} className="text-brand-muted" />,
  error:        <WifiOff size={14} className="text-red-400" />,
};

const STATUS_LABEL = {
  connected:    'Connecté',
  connecting:   'Connexion…',
  disconnected: 'Déconnecté',
  error:        'Serveur temps réel indisponible',
};

export function GPSMonitor() {
  const { on, joinChannel, leaveChannel } = useSocket();
  const socketStatus = useAppSelector((s) => s.socket.status);
  const [positions, setPositions] = useState<Map<number, LiveDepanneur>>(new Map());

  useEffect(() => {
    joinChannel('admin.dashboard', false);
    const off = on<LiveDepanneur>('gps.updated', (data) => {
      setPositions((prev) => new Map(prev).set(data.mission_uuid, data));
    }, 'admin.dashboard', false);
    return () => { leaveChannel('admin.dashboard'); off(); };
  }, [on, joinChannel, leaveChannel]);

  const active = Array.from(positions.values()) as LiveDepanneur[];

  return (
    <div className="flex flex-col gap-3 h-[calc(100dvh-7rem)] md:h-[calc(100dvh-5rem)]">

      {/* Titre + statut */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-brand-text text-2xl font-bold">GPS Live</h1>
        <div className="flex items-center gap-2">
          {STATUS_ICON[socketStatus as keyof typeof STATUS_ICON] ?? STATUS_ICON.disconnected}
          <span className={`text-xs font-medium ${socketStatus === 'connected' ? 'text-green-400' : socketStatus === 'error' ? 'text-red-400' : 'text-brand-muted'}`}>
            {STATUS_LABEL[socketStatus as keyof typeof STATUS_LABEL] ?? STATUS_LABEL.disconnected}
          </span>
          {socketStatus === 'connected' && (
            <>
              <span className="text-brand-muted text-xs">·</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping-slow" />
              <span className="text-green-400 text-xs font-medium">{active.length} actif(s)</span>
            </>
          )}
        </div>
      </div>

      {/* Bannière si serveur WS indisponible */}
      {(socketStatus === 'error' || socketStatus === 'disconnected') && (
        <div className="flex-shrink-0 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2.5">
          <WifiOff size={15} className="text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300 text-xs">
            Le serveur temps réel n'est pas démarré. La carte reste visible mais les positions GPS ne se mettent pas à jour en direct.
          </p>
        </div>
      )}

      {/* Carte — prend tout l'espace restant */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-brand-border min-h-0">
        <MapContainer>
          {active.map((dep) => (
            <Marker key={dep.mission_uuid} position={[dep.depanneur_lat, dep.depanneur_lng]} icon={depanneurIcon}>
              <Popup>
                <div className="text-slate-900">
                  <p className="font-bold">{dep.depanneur_name ?? 'Dépanneur'}</p>
                  {dep.distance_km  && <p className="text-xs">Distance : {dep.distance_km.toFixed(1)} km</p>}
                  {dep.eta_minutes  && <p className="text-xs">ETA : {dep.eta_minutes} min</p>}
                  <p className="text-xs text-slate-500">Mission : {dep.mission_uuid.slice(0, 8)}…</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Liste dépanneurs actifs */}
      {active.length > 0 && (
        <div className="flex-shrink-0 grid gap-2 max-h-40 overflow-y-auto">
          {active.map((dep) => (
            <Card key={dep.mission_uuid}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-text font-medium text-sm">{dep.depanneur_name ?? 'Dépanneur'}</p>
                    <p className="text-brand-muted text-xs">{dep.depanneur_lat.toFixed(5)}, {dep.depanneur_lng.toFixed(5)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 text-xs font-medium">En mission</span>
                    {dep.eta_minutes && <p className="text-brand-muted text-xs">ETA {dep.eta_minutes} min</p>}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

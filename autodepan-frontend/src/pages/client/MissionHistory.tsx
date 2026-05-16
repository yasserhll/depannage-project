import { useQuery } from '@tanstack/react-query';
import { Car } from 'lucide-react';
import { missionService } from '@/services/mission.service';
import { MissionCard } from '@/components/mission/MissionCard';
import { Spinner } from '@/components/common/Spinner';
import type { Mission } from '@/types/mission.types';

export function MissionHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['client-missions'],
    queryFn:  () => missionService.getClientMissions(),
  });

  const missions = data?.missions ?? [];

  return (
    <div className="px-4 py-5">
      <h1 className="text-brand-text text-xl font-bold mb-5">Mes missions</h1>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && missions.length === 0 && (
        <div className="text-center py-16">
          <Car className="w-12 h-12 text-brand-muted mx-auto mb-4" />
          <p className="text-brand-muted">Aucune mission pour le moment.</p>
          <p className="text-brand-muted text-sm mt-1">
            Votre historique de dépannages apparaîtra ici.
          </p>
        </div>
      )}

      {missions.map((mission: Mission) => (
        <MissionCard key={mission.id} mission={mission} roleBase="client" />
      ))}
    </div>
  );
}

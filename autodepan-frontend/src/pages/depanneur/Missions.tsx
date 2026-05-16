import { useQuery } from '@tanstack/react-query';
import { Wrench } from 'lucide-react';
import { missionService } from '@/services/mission.service';
import { MissionCard } from '@/components/mission/MissionCard';
import { Spinner } from '@/components/common/Spinner';
import type { Mission } from '@/types/mission.types';

export function DepanneurMissions() {
  const { data, isLoading } = useQuery({
    queryKey: ['depanneur-missions'],
    queryFn:  () => missionService.getDepanneurMissions(),
  });

  const missions = data?.missions ?? [];

  return (
    <div className="px-4 py-5">
      <h1 className="text-brand-text text-xl font-bold mb-5">Mes missions</h1>
      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}
      {!isLoading && missions.length === 0 && (
        <div className="text-center py-16">
          <Wrench className="w-12 h-12 text-brand-muted mx-auto mb-3" />
          <p className="text-brand-muted">Aucune mission effectuée.</p>
        </div>
      )}
      {missions.map((m: Mission) => (
        <MissionCard key={m.id} mission={m} roleBase="depanneur" />
      ))}
    </div>
  );
}

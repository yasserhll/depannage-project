import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { MissionBadge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Mission } from '@/types/mission.types';

export function AdminMissions() {
  const navigate              = useNavigate();
  const [status, setStatus]   = useState('');
  const [search, setSearch]   = useState('');

  const { data, isLoading } = useQuery<{ missions: Mission[]; pagination: object }>({
    queryKey: ['admin-missions', status, search],
    queryFn:  () => api.get('/admin/missions', { status: status || undefined, search: search || undefined }),
    refetchInterval: 15_000,
  });

  const missions = data?.missions ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-brand-text text-2xl font-bold">Missions</h1>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Rechercher (UUID, client)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface border border-brand-border text-brand-text rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tous statuts</option>
          <option value="searching">En recherche</option>
          <option value="accepted">Acceptée</option>
          <option value="en_route">En route</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
          <option value="disputed">Litige</option>
        </select>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      <div className="grid gap-3">
        {missions.map((m) => (
          <Card
            key={m.id}
            onClick={() => navigate(`/admin/missions/${m.uuid}`)}
          >
            <CardBody>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-brand-text font-semibold text-sm">{m.breakdown_type}</p>
                  <p className="text-brand-muted text-xs font-mono truncate">{m.uuid}</p>
                </div>
                <MissionBadge status={m.status} />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {m.client && (
                  <p className="text-brand-muted">
                    Client : <span className="text-brand-text">{m.client.name}</span>
                  </p>
                )}
                {m.depanneur && (
                  <p className="text-brand-muted">
                    Dépanneur : <span className="text-brand-text">{m.depanneur.name}</span>
                  </p>
                )}
                {m.final_price && (
                  <p className="text-brand-muted">
                    Prix : <span className="text-green-400 font-bold">{formatCurrency(m.final_price)}</span>
                  </p>
                )}
                <p className="text-brand-muted">
                  {formatDate(m.created_at)}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}

        {!isLoading && missions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-muted">Aucune mission trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}

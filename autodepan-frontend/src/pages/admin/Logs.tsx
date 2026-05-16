import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { formatDate } from '@/lib/utils';

interface ActivityLog {
  id:         number;
  user_id:    number | null;
  action:     string;
  model_type: string | null;
  model_id:   number | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_COLOR: Record<string, string> = {
  'kyc.approved':        'text-green-400',
  'kyc.rejected':        'text-red-400',
  'payment.released':    'text-green-400',
  'payment.refunded':    'text-amber-400',
  'dispute.resolved':    'text-blue-400',
  'user.status_changed': 'text-orange-400',
  'user.deleted':        'text-red-400',
};

export function AdminLogs() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<{ logs: ActivityLog[] }>({
    queryKey: ['admin-logs', search],
    queryFn:  () => api.get('/admin/logs', { search: search || undefined }),
    refetchInterval: 30_000,
  });

  const logs = data?.logs ?? [];
  const filtered = search
    ? logs.filter((l) => l.action.includes(search) || String(l.user_id).includes(search))
    : logs;

  return (
    <div className="space-y-4">
      <h1 className="text-brand-text text-2xl font-bold">Logs d'activité</h1>

      <Input
        placeholder="Filtrer par action ou utilisateur…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      <div className="grid gap-2">
        {filtered.map((log) => (
          <Card key={log.id}>
            <CardBody className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-mono font-medium ${ACTION_COLOR[log.action] ?? 'text-brand-text'}`}>
                    {log.action}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-brand-muted mt-0.5">
                    {log.model_type && log.model_id && (
                      <span>{log.model_type.split('\\').pop()} #{log.model_id}</span>
                    )}
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                    {log.user_id    && <span>Par user #{log.user_id}</span>}
                  </div>
                </div>
                <span className="text-brand-muted text-xs flex-shrink-0 text-right">
                  {formatDate(log.created_at)}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-muted">Aucun log trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
}

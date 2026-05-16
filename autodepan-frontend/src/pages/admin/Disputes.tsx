import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Scale } from 'lucide-react';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { formatDate } from '@/lib/utils';
import toast from '@/lib/toast';

interface Dispute {
  id:            number;
  mission_id:    number;
  reason:        string;
  description:   string;
  status:        string;
  opened_by_type: string;
  created_at:    string;
}

export function AdminDisputes() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [note,     setNote]     = useState('');

  const { data, isLoading } = useQuery<{ disputes: Dispute[] }>({
    queryKey: ['admin-disputes'],
    queryFn:  () => api.get('/admin/disputes'),
    refetchInterval: 30_000,
  });

  const { mutate: resolve } = useMutation({
    mutationFn: ({ id, resolution }: { id: number; resolution: string }) =>
      api.post(`/admin/disputes/${id}/resolve`, { resolution, admin_note: note || '—' }),
    onSuccess: () => {
      toast.success('Litige résolu.');
      setSelected(null);
      setNote('');
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
  });

  const disputes = data?.disputes ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-brand-text text-2xl font-bold">Litiges ({disputes.length})</h1>
      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {disputes.map((d) => (
            <Card key={d.id} onClick={() => setSelected(d)} className={selected?.id === d.id ? 'border-red-500' : ''}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-brand-text font-medium text-sm">{d.reason}</p>
                    <p className="text-brand-muted text-xs mt-1">Ouvert par : {d.opened_by_type}</p>
                    <p className="text-brand-muted text-xs">{formatDate(d.created_at)}</p>
                  </div>
                  <Badge color={d.status === 'open' ? 'error' : 'success'}>{d.status}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
          {disputes.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Scale size={48} className="text-brand-muted opacity-40" />
              <p className="text-brand-muted text-sm">Aucun litige ouvert.</p>
            </div>
          )}
        </div>

        {selected && (
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-brand-text font-bold">Litige #{selected.id}</h2>
              <p className="text-brand-text text-sm">{selected.description}</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note de résolution…"
                rows={3}
                className="w-full bg-surface-raised border border-brand-border rounded-xl
                           px-4 py-3 text-brand-text text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-3">
                <Button size="sm" variant="outline" fullWidth
                  onClick={() => resolve({ id: selected.id, resolution: 'refund_client' })}>
                  → Client
                </Button>
                <Button size="sm" variant="secondary" fullWidth
                  onClick={() => resolve({ id: selected.id, resolution: 'release_depanneur' })}>
                  → Dépanneur
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

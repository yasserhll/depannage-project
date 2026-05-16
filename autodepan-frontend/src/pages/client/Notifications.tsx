import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types/user.types';

export function Notifications() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ notifications: Notification[]; unread_count: number }>({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/notifications'),
    refetchInterval: 30_000,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: () => api.post('/notifications/read-all', {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications ?? [];
  const unread        = data?.unread_count ?? 0;

  return (
    <div className="px-4 py-5 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-brand-text text-xl font-bold">Notifications</h1>
          {unread > 0 && (
            <p className="text-primary text-xs mt-0.5">{unread} non lue{unread > 1 ? 's' : ''}</p>
          )}
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" loading={markingAll} onClick={() => markAllRead()}>
            Tout marquer lu
          </Button>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {!isLoading && notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-brand-muted mx-auto mb-3" />
          <p className="text-brand-muted">Aucune notification.</p>
        </div>
      )}

      {notifications.map((n) => (
        <Card
          key={n.id}
          onClick={() => !n.read_at && markRead(n.id)}
          className={n.read_at ? 'opacity-70' : 'border-primary/30'}
        >
          <CardBody>
            <div className="flex items-start gap-3">
              {!n.read_at && (
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
              )}
              <div className="flex-1">
                <p className="text-brand-text text-sm font-medium">
                  {(n.data as { title?: string }).title ?? n.type}
                </p>
                <p className="text-brand-muted text-xs mt-0.5 leading-relaxed">
                  {(n.data as { body?: string }).body ?? ''}
                </p>
                <p className="text-brand-muted text-[10px] mt-1.5">
                  {formatRelativeTime(n.created_at)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

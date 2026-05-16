import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Pause, Ban } from 'lucide-react';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { formatDate } from '@/lib/utils';
import toast from '@/lib/toast';
import type { User } from '@/types/auth.types';

const ROLE_COLOR: Record<string, 'info' | 'warning' | 'error'> = {
  client:    'info',
  depanneur: 'warning',
  admin:     'error',
};

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  active:    'success',
  suspended: 'warning',
  banned:    'error',
  pending:   'info',
};

export function AdminUsers() {
  const qc                      = useQueryClient();
  const [search,  setSearch]    = useState('');
  const [role,    setRole]      = useState('');
  const [status,  setStatus]    = useState('');

  const { data, isLoading } = useQuery<{ users: User[]; pagination: object }>({
    queryKey: ['admin-users', search, role, status],
    queryFn:  () => api.get('/admin/users', { search: search || undefined, role: role || undefined, status: status || undefined }),
    refetchInterval: 30_000,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      api.patch(`/admin/users/${id}/status`, { status: newStatus }),
    onSuccess: () => { toast.success('Statut mis à jour.'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError:   () => toast.error('Erreur.'),
  });

  const users = data?.users ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-brand-text text-2xl font-bold">Utilisateurs</h1>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Rechercher (nom, email, tél)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-surface border border-brand-border text-brand-text rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="depanneur">Dépanneur</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface border border-brand-border text-brand-text rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tous statuts</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="banned">Banni</option>
        </select>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      <div className="grid gap-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-brand-text font-semibold">{user.name}</p>
                  <p className="text-brand-muted text-xs">{user.email}</p>
                  {user.phone && <p className="text-brand-muted text-xs">{user.phone}</p>}
                  <p className="text-brand-muted text-xs mt-1">Inscrit le {formatDate(user.created_at)}</p>
                </div>
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <Badge color={ROLE_COLOR[user.role] ?? 'info'}>{user.role}</Badge>
                  <Badge color={STATUS_COLOR[user.status] ?? 'info'}>{user.status}</Badge>
                </div>
              </div>

              {user.role !== 'admin' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-brand-border">
                  {user.status !== 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus({ id: user.id, newStatus: 'active' })}
                    >
                      <Check className="w-4 h-4 inline mr-1" /> Réactiver
                    </Button>
                  )}
                  {user.status !== 'suspended' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus({ id: user.id, newStatus: 'suspended' })}
                    >
                      <Pause className="w-4 h-4 inline mr-1" /> Suspendre
                    </Button>
                  )}
                  {user.status !== 'banned' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm(`Bannir ${user.name} ?`)) {
                          updateStatus({ id: user.id, newStatus: 'banned' });
                        }
                      }}
                    >
                      <Ban className="w-4 h-4 inline mr-1" /> Bannir
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        ))}

        {!isLoading && users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-muted">Aucun utilisateur trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
}

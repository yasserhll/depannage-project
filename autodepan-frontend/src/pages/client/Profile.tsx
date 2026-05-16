import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { Card, CardBody, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { authService } from '@/services/auth.service';
import { getInitials } from '@/lib/utils';
import toast from '@/lib/toast';

export function ClientProfile() {
  const dispatch  = useAppDispatch();
  const user      = useAppSelector((s) => s.auth.user);
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(user?.name ?? '');

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: () => authService.updateProfile({ name }),
    onSuccess:  ({ user: updated }) => {
      dispatch(setUser(updated));
      setEditing(false);
      toast.success('Profil mis à jour.');
    },
    onError: () => toast.error('Impossible de mettre à jour le profil.'),
  });

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      <h1 className="text-brand-text text-xl font-bold">Mon profil</h1>

      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-black text-xl">{user ? getInitials(user.name) : '?'}</span>
            </div>
            <div>
              <p className="text-brand-text font-bold text-lg">{user?.name}</p>
              <p className="text-brand-muted text-sm">{user?.email}</p>
              {user?.phone && <p className="text-brand-muted text-sm">{user.phone}</p>}
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <Input
                label="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => { setEditing(false); setName(user?.name ?? ''); }}>
                  Annuler
                </Button>
                <Button fullWidth loading={isPending} onClick={() => saveProfile()}>
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" fullWidth onClick={() => setEditing(true)}>
              <Pencil size={14} className="mr-2" />
              Modifier le profil
            </Button>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-brand-text font-semibold">Informations du compte</p>
        </CardHeader>
        <CardBody className="p-0">
          <Row label="Rôle"       value={user?.role ?? '—'} />
          <Row label="Statut"     value={user?.status ?? '—'} />
          <Row label="Locale"     value={user?.locale ?? 'fr'} last />
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${!last ? 'border-b border-brand-border' : ''}`}>
      <span className="text-brand-muted text-sm">{label}</span>
      <span className="text-brand-text text-sm font-medium capitalize">{value}</span>
    </div>
  );
}

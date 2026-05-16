import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileEdit, ArrowRight, Star, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';
import { Card, CardBody, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { authService } from '@/services/auth.service';
import { getInitials } from '@/lib/utils';
import toast from '@/lib/toast';

export function DepanneurProfile() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const user       = useAppSelector((s) => s.auth.user);
  const [editing,  setEditing]  = useState(false);
  const [name,     setName]     = useState(user?.name ?? '');

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: () => authService.updateProfile({ name }),
    onSuccess:  ({ user: updated }) => {
      dispatch(setUser(updated));
      setEditing(false);
      toast.success('Profil mis à jour.');
    },
    onError: () => toast.error('Erreur de mise à jour.'),
  });

  const { mutate: doLogout } = useMutation({
    mutationFn: () => authService.logout(),
    onSettled:  () => {
      dispatch(logout());
      navigate('/auth/connexion', { replace: true });
    },
  });

  const KYC_BADGE: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' }> = {
    pending:   { label: 'En attente de soumission', color: 'info' },
    in_review: { label: 'En cours de vérification', color: 'warning' },
    approved:  { label: 'KYC validé',               color: 'success' },
    rejected:  { label: 'KYC rejeté',               color: 'error' },
  };

  const kyc = user?.depanneur_profile?.kyc_status ?? 'pending';
  const kycInfo = KYC_BADGE[kyc] ?? KYC_BADGE.pending;

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      <h1 className="text-brand-text text-xl font-bold">Mon profil</h1>

      {/* Avatar + infos */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-black text-xl">{user ? getInitials(user.name) : '?'}</span>
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
                <Button fullWidth loading={isPending} onClick={() => saveProfile()} className="bg-blue-600 hover:bg-blue-700">
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" fullWidth onClick={() => setEditing(true)}>
              <FileEdit className="w-4 h-4 inline mr-1" /> Modifier le profil
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Statut KYC */}
      <Card>
        <CardHeader><p className="text-brand-text font-semibold">Statut KYC</p></CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <Badge color={kycInfo.color}>{kycInfo.label}</Badge>
            {kyc !== 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/depanneur/documents')}
              >
                Mes documents <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </Button>
            )}
          </div>

          {user?.depanneur_profile && (
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-brand-border">
              <Stat label="Missions" value={user.depanneur_profile.total_missions} />
              <Stat label="Note"     value={<span className="flex items-center gap-1 justify-center">{Number(user.depanneur_profile.rating_avg).toFixed(1)} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /></span>} />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Déconnexion */}
      <Button variant="danger" fullWidth onClick={() => doLogout()}>
        <LogOut className="w-4 h-4 inline mr-1" /> Se déconnecter
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number | React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-brand-text text-xl font-black">{value}</p>
      <p className="text-brand-muted text-xs">{label}</p>
    </div>
  );
}

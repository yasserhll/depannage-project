import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Map, ClipboardList, Bell, User, LogOut, X, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { queryClient } from '@/lib/queryClient';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { InstallButton } from '@/components/pwa/InstallButton';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/client',                 label: 'Carte',        Icon: Map,           end: true  },
  { to: '/client/missions',        label: 'Missions',     Icon: ClipboardList, end: false },
  { to: '/client/notifications',   label: 'Alertes',      Icon: Bell,          end: false },
  { to: '/client/profil',          label: 'Profil',       Icon: User,          end: false },
];

export function ClientLayout() {
  const dispatch              = useAppDispatch();
  const navigate              = useNavigate();
  const user                  = useAppSelector((s) => s.auth.user);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);

  const confirmLogout = async () => {
    setLoading(true);
    await authService.logout().catch(() => {});
    queryClient.cancelQueries();
    queryClient.clear();
    dispatch(logout());
    navigate('/auth/connexion', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col max-w-md mx-auto relative">
      <OfflineBanner />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-brand-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">A</span>
          </div>
          <div>
            <p className="text-brand-text font-bold text-sm leading-none">AutoDepan</p>
            <p className="text-primary text-[10px] font-medium">Espace Client</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InstallButton compact />
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/40
                       text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Navigation bas */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md
                      bg-surface border-t border-brand-border z-40
                      flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                isActive ? 'text-primary' : 'text-brand-muted hover:text-brand-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-6 h-6', isActive && 'scale-110 transition-transform')} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Modal confirmation déconnexion */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-brand-text font-bold text-base">Déconnexion</p>
                  <p className="text-brand-muted text-xs mt-0.5">{user?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-brand-muted hover:text-brand-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-brand-muted text-sm mb-6">
              Voulez-vous vraiment vous déconnecter de votre compte ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-brand-border
                           text-brand-text text-sm font-semibold
                           hover:bg-surface-raised transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700
                           text-white text-sm font-semibold flex items-center justify-center gap-2
                           transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loading ? 'Déconnexion…' : 'Oui, déconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

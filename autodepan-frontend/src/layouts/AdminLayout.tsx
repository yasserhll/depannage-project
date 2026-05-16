import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  CreditCard,
  Scale,
  MapPin,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin',              label: 'Dashboard',    end: true,  icon: LayoutDashboard },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', end: false, icon: Users           },
  { to: '/admin/kyc',          label: 'KYC',          end: false, icon: ShieldCheck     },
  { to: '/admin/missions',     label: 'Missions',     end: false, icon: ClipboardList   },
  { to: '/admin/paiements',    label: 'Paiements',    end: false, icon: CreditCard      },
  { to: '/admin/litiges',      label: 'Litiges',      end: false, icon: Scale           },
  { to: '/admin/gps-live',     label: 'GPS Live',     end: false, icon: MapPin          },
  { to: '/admin/logs',         label: 'Logs',         end: false, icon: FileText        },
];

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user     = useAppSelector((s) => s.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    queryClient.cancelQueries();
    queryClient.clear();
    dispatch(logout());
    navigate('/auth/connexion', { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-brand-bg flex">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-surface border-r border-brand-border flex flex-col z-30 transition-transform duration-300',
          'lg:translate-x-0 lg:w-56',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header sidebar */}
        <div className="px-5 py-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">A</span>
              </div>
              <span className="text-brand-text font-bold">AutoDepan</span>
            </div>
            <p className="text-red-400 text-[10px] font-semibold pl-9">Administration</p>
          </div>
          {/* Bouton fermeture mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-text hover:bg-surface-raised transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-brand-muted hover:text-brand-text hover:bg-surface-raised',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-red-400' : 'text-brand-muted'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-brand-border">
          <div className="px-3 mb-3">
            <p className="text-brand-text text-sm font-medium truncate">{user?.name}</p>
            <p className="text-brand-muted text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="lg:ml-56 flex-1 min-h-screen flex flex-col">
        {/* Header mobile */}
        <header className="lg:hidden sticky top-0 z-10 bg-surface border-b border-brand-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-text hover:bg-surface-raised transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <span className="text-white font-black text-[10px]">A</span>
            </div>
            <span className="text-brand-text font-bold text-sm">AutoDepan</span>
          </div>
        </header>

        <main className="p-4 md:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

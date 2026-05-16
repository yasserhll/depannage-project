import { useQuery } from '@tanstack/react-query';
import { Car, Zap, Clock, AlertTriangle, User, Wrench, Circle, ClipboardList, Scale, Radio, DollarSign } from 'lucide-react';
import { api } from '@/lib/fetcher';
import { Card, CardBody, CardHeader } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { formatCurrency } from '@/lib/utils';
import type React from 'react';

interface AdminStats {
  missions_today:       number;
  missions_total:       number;
  active_missions:      number;
  clients_total:        number;
  depanneurs_total:     number;
  depanneurs_active:    number;
  depanneurs_pending_kyc: number;
  revenue_today:        number;
  revenue_total:        number;
  open_disputes:        number;
}

type IconComponent = React.ComponentType<{ className?: string }>;

export function AdminDashboard() {
  const { data, isLoading } = useQuery<{ data: AdminStats }>({
    queryKey: ['admin-stats'],
    queryFn:  () => api.get('/admin/dashboard'),
    refetchInterval: 30_000,
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-brand-text text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-brand-muted text-sm mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Missions aujourd'hui" value={stats?.missions_today ?? 0} icon={Car} color="orange" />
        <KPICard label="Missions actives"      value={stats?.active_missions ?? 0}  icon={Zap} color="green"  />
        <KPICard label="KYC en attente"        value={stats?.depanneurs_pending_kyc ?? 0} icon={Clock} color="amber" urgent={!!stats?.depanneurs_pending_kyc} />
        <KPICard label="Litiges ouverts"       value={stats?.open_disputes ?? 0}    icon={AlertTriangle} color="red"   urgent={!!stats?.open_disputes} />
      </div>

      {/* Revenus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <p className="text-brand-text font-bold">Revenus</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <RevenueRow label="Aujourd'hui"     value={stats?.revenue_today ?? 0} />
              <RevenueRow label="Total plateforme" value={stats?.revenue_total ?? 0} highlight />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-brand-text font-bold">Utilisateurs</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <UserRow label="Clients"              value={stats?.clients_total ?? 0} icon={User} />
              <UserRow label="Dépanneurs (total)"   value={stats?.depanneurs_total ?? 0} icon={Wrench} />
              <UserRow label="Dépanneurs connectés" value={stats?.depanneurs_active ?? 0} icon={Circle} iconClassName="fill-green-500 text-green-500" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([
          { label: 'Valider KYC',  href: '/admin/kyc',      icon: ClipboardList, urgent: !!stats?.depanneurs_pending_kyc },
          { label: 'Litiges',      href: '/admin/litiges',  icon: Scale,         urgent: !!stats?.open_disputes },
          { label: 'GPS Live',     href: '/admin/gps-live', icon: Radio,         urgent: false },
          { label: 'Paiements',    href: '/admin/paiements',icon: DollarSign,    urgent: false },
        ] as { label: string; href: string; icon: IconComponent; urgent: boolean }[]).map(({ label, href, icon: Icon, urgent }) => (
          <a
            key={href}
            href={href}
            className={`
              block p-4 rounded-xl border transition-colors text-center
              ${urgent
                ? 'bg-red-600/10 border-red-600/30 hover:bg-red-600/20'
                : 'bg-surface border-brand-border hover:bg-surface-raised'
              }
            `}
          >
            <Icon className="w-6 h-6 mx-auto mb-1" />
            <span className={`text-sm font-medium ${urgent ? 'text-red-400' : 'text-brand-text'}`}>
              {label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, color, urgent }: {
  label: string; value: number; icon: IconComponent; color: string; urgent?: boolean;
}) {
  const colors: Record<string, string> = {
    orange: 'border-orange-500/30 bg-orange-500/10',
    green:  'border-green-500/30  bg-green-500/10',
    amber:  'border-amber-500/30  bg-amber-500/10',
    red:    'border-red-500/30    bg-red-500/10',
  };
  return (
    <Card className={`${colors[color]} ${urgent ? 'animate-pulse' : ''}`}>
      <CardBody>
        <Icon className="w-6 h-6" />
        <p className="text-brand-text text-2xl font-black mt-2">{value.toLocaleString('fr-FR')}</p>
        <p className="text-brand-muted text-xs mt-1">{label}</p>
      </CardBody>
    </Card>
  );
}

function RevenueRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-brand-muted text-sm">{label}</span>
      <span className={`font-bold ${highlight ? 'text-green-400 text-lg' : 'text-brand-text'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function UserRow({ label, value, icon: Icon, iconClassName }: { label: string; value: number; icon: IconComponent; iconClassName?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-brand-muted text-sm flex items-center gap-1.5">
        <Icon className={`w-4 h-4 ${iconClassName ?? ''}`} />
        {label}
      </span>
      <span className="text-brand-text font-bold">{value.toLocaleString('fr-FR')}</span>
    </div>
  );
}

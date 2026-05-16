import { cn } from '@/lib/utils';
import type { MissionStatus } from '@/types/mission.types';
import { MISSION_STATUS_LABELS } from '@/types/mission.types';

const STATUS_BG: Record<MissionStatus, string> = {
  searching:   'bg-orange-500/15 text-orange-400 border-orange-500/30',
  accepted:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  en_route:    'bg-sky-500/15 text-sky-400 border-sky-500/30',
  arrived:     'bg-green-500/15 text-green-400 border-green-500/30',
  in_progress: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  completed:   'bg-green-600/15 text-green-500 border-green-600/30',
  cancelled:   'bg-red-500/15 text-red-400 border-red-500/30',
  disputed:    'bg-red-700/15 text-red-500 border-red-700/30',
};

export function MissionBadge({ status }: { status: MissionStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border', STATUS_BG[status])}>
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}

export function Badge({ children, color = 'default', className }: {
  children: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}) {
  const colors = {
    default: 'bg-surface-raised text-brand-muted',
    success: 'bg-green-500/15 text-green-400',
    warning: 'bg-yellow-500/15 text-yellow-400',
    error:   'bg-red-500/15 text-red-400',
    info:    'bg-blue-500/15 text-blue-400',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  );
}

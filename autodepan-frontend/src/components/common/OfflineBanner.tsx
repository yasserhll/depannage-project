import { AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-900
                    text-center py-2 text-sm font-semibold animate-fade-in flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      Hors ligne — Certaines fonctionnalités sont indisponibles
    </div>
  );
}

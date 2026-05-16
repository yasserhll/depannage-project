import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function UpdatePrompt() {
  const [show, setShow] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Vérification de mise à jour toutes les 60 min
      r && setInterval(() => r.update(), 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    if (needRefresh) setShow(true);
  }, [needRefresh]);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto
                    bg-surface border border-brand-border rounded-2xl p-4 shadow-card
                    animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <RefreshCw size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-brand-text font-semibold text-sm">Mise à jour disponible</p>
          <p className="text-brand-muted text-xs mt-0.5">Une nouvelle version d'AutoDepan est disponible.</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShow(false)}
          className="flex-1"
        >
          Plus tard
        </Button>
        <Button
          size="sm"
          onClick={() => updateServiceWorker(true)}
          className="flex-1"
        >
          Mettre à jour
        </Button>
      </div>
    </div>
  );
}

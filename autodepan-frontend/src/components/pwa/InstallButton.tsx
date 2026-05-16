import { useState } from 'react';
import { Download, Share } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { cn } from '@/lib/utils';

interface InstallButtonProps {
  compact?: boolean;
}

export function InstallButton({ compact = false }: InstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showFallback, setShowFallback] = useState(false);

  if (isInstalled) return null;

  const btnClass = cn(
    'flex items-center gap-2 bg-primary text-white font-semibold rounded-xl',
    'shadow-glow-orange transition-all duration-200 active:scale-95',
    compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
  );

  /* ─── iOS ─── */
  if (isIOS) {
    return (
      <>
        <button onClick={() => setShowFallback(true)} className={btnClass}>
          <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          {!compact && "Installer l'app"}
        </button>

        {showFallback && (
          <IOSSheet onClose={() => setShowFallback(false)} />
        )}
      </>
    );
  }

  /* ─── Android : prompt natif disponible ─── */
  if (isInstallable) {
    return (
      <button onClick={install} className={btnClass}>
        <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {!compact && "Installer l'app"}
      </button>
    );
  }

  /* ─── Android : prompt pas encore prêt — fallback menu Chrome ─── */
  const isAndroid = /android/i.test(navigator.userAgent);
  if (!isAndroid) return null;

  return (
    <>
      <button onClick={() => setShowFallback(true)} className={btnClass}>
        <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {!compact && "Installer l'app"}
      </button>

      {showFallback && (
        <AndroidSheet onClose={() => setShowFallback(false)} />
      )}
    </>
  );
}

/* ─── Bottom sheet Android fallback ─── */
function AndroidSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface border-t border-brand-border rounded-t-3xl p-6 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-brand-muted/40 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-5">
          <img src="/icons/icon-72x72.png" alt="AutoDepan" className="w-12 h-12 rounded-2xl" />
          <div>
            <p className="text-brand-text font-bold">AutoDepan</p>
            <p className="text-brand-muted text-xs">Ajouter à l'écran d'accueil</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-raised rounded-xl px-4 py-4 mb-6">
          <span className="text-2xl">⋮</span>
          <p className="text-brand-text text-sm leading-relaxed">
            Appuyez sur <span className="font-bold text-primary">⋮</span> (menu Chrome)
            {' '}puis{' '}
            <span className="font-bold text-primary">« Ajouter à l'écran d'accueil »</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl text-sm active:scale-95 transition-transform"
        >
          Compris !
        </button>
      </div>
    </div>
  );
}

/* ─── Bottom sheet iOS ─── */
function IOSSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface border-t border-brand-border rounded-t-3xl p-6 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-brand-muted/40 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-5">
          <img src="/icons/icon-72x72.png" alt="AutoDepan" className="w-12 h-12 rounded-2xl" />
          <div>
            <p className="text-brand-text font-bold">AutoDepan</p>
            <p className="text-brand-muted text-xs">Ajouter à l'écran d'accueil</p>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 bg-surface-raised rounded-xl px-4 py-3">
            <Share size={18} className="text-primary flex-shrink-0" />
            <p className="text-brand-text text-sm">
              Appuyez sur <span className="font-bold text-primary">Partager</span>
              <span className="text-brand-muted"> (bas de Safari)</span>
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface-raised rounded-xl px-4 py-3">
            <span className="text-xl flex-shrink-0">＋</span>
            <p className="text-brand-text text-sm">
              <span className="font-bold text-primary">« Sur l'écran d'accueil »</span>
              {' '}→ <span className="font-bold">Ajouter</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl text-sm active:scale-95 transition-transform"
        >
          Compris !
        </button>
      </div>
    </div>
  );
}

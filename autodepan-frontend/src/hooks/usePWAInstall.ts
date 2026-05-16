import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt:     () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Capture l'event DÈS le chargement du module, avant que React monte.
// Sans ça, l'event se déclenche avant useEffect → perdu → bouton invisible.
let _deferredPrompt: BeforeInstallPromptEvent | null = null;
let _promptListeners: Array<(e: BeforeInstallPromptEvent) => void> = [];

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredPrompt = e as BeforeInstallPromptEvent;
  _promptListeners.forEach((fn) => fn(_deferredPrompt!));
});

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled:   boolean;
  isIOS:         boolean;
  install:       () => Promise<boolean>;
}

export function usePWAInstall(): PWAInstallState {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    _deferredPrompt,
  );
  const [isInstallable, setIsInstallable] = useState(!!_deferredPrompt);
  const [isInstalled,   setIsInstalled]   = useState(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    return mq.matches || (navigator as { standalone?: boolean }).standalone === true;
  });

  useEffect(() => {
    if (isInstalled) return;

    // Si l'event est arrivé après le mount, on le reçoit via le listener global
    const onPrompt = (e: BeforeInstallPromptEvent) => {
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    _promptListeners.push(onPrompt);

    const onInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      _deferredPrompt = null;
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      _promptListeners = _promptListeners.filter((fn) => fn !== onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [isInstalled]);

  const install = useCallback(async (): Promise<boolean> => {
    const prompt = installPrompt ?? _deferredPrompt;
    if (!prompt) return false;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstallable(false);
      _deferredPrompt = null;
      return true;
    }
    return false;
  }, [installPrompt]);

  return { isInstallable, isInstalled, isIOS, install };
}

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';

export function useNotifications() {
  const { mutate: registerToken } = useMutation({
    mutationFn: (token: string) => api.post('/client/fcm-token', { token, platform: 'web' }),
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey      = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) return false;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Enregistrer le token côté backend
      const token = JSON.stringify(subscription);
      registerToken(token);
      return true;
    } catch {
      return false;
    }
  }, [registerToken]);

  return { requestPermission };
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const arr     = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

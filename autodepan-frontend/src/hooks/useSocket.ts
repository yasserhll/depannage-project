import { useEffect, useCallback } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSocketStatus } from '@/store/slices/socketSlice';
import { REVERB_CONFIG } from '@/config/socket';

(window as any).Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;

function getOrCreateEcho(token: string): Echo<'reverb'> {
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster:       'reverb',
      key:               REVERB_CONFIG.key,
      wsHost:            REVERB_CONFIG.host,
      wsPort:            REVERB_CONFIG.port,
      wssPort:           REVERB_CONFIG.port,
      forceTLS:          REVERB_CONFIG.scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
  }
  return echoInstance;
}

export function useSocket() {
  const dispatch = useAppDispatch();
  const token    = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;

    const echo = getOrCreateEcho(token);
    const conn = (echo as any).connector?.pusher?.connection;
    if (!conn) return;

    dispatch(setSocketStatus('connecting'));
    conn.bind('connected',    () => dispatch(setSocketStatus('connected')));
    conn.bind('disconnected', () => dispatch(setSocketStatus('disconnected')));
    conn.bind('failed',       () => dispatch(setSocketStatus('error')));
    conn.bind('unavailable',  () => dispatch(setSocketStatus('error')));
  }, [token, dispatch]);

  /**
   * Écouter un événement sur un canal Reverb.
   * @param event       Nom de l'événement Laravel (ex: 'gps.updated', 'chat.message')
   * @param handler     Callback appelé avec les données de l'événement
   * @param channelName Nom du canal (ex: 'admin.dashboard', 'mission.abc123')
   * @param isPrivate   true → canal privé, false → canal public
   */
  const on = useCallback(<T>(
    event:       string,
    handler:     (data: T) => void,
    channelName  = 'admin.dashboard',
    isPrivate    = false,
  ) => {
    if (!echoInstance) return () => {};
    const channel = isPrivate
      ? echoInstance.private(channelName)
      : echoInstance.channel(channelName);
    channel.listen(`.${event}`, handler);
    return () => { channel.stopListening(`.${event}`, handler); };
  }, []);

  /** Emit n'est pas supporté par Reverb côté client — utiliser l'API HTTP */
  const emit = useCallback((_event: string, _data?: unknown) => {}, []);

  const joinChannel  = useCallback((name: string, priv = false) => {
    if (!echoInstance) return;
    priv ? echoInstance.private(name) : echoInstance.channel(name);
  }, []);

  const leaveChannel = useCallback((name: string) => {
    echoInstance?.leave(name);
  }, []);

  return {
    echo:       echoInstance,
    on,
    emit,
    joinChannel,
    leaveChannel,
    isConnected: (echoInstance as any)?.connector?.pusher?.connection?.state === 'connected',
  };
}

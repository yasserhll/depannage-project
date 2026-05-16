export const REVERB_CONFIG = {
  key:    import.meta.env.VITE_REVERB_APP_KEY  ?? 'autodepan-key',
  host:   import.meta.env.VITE_REVERB_HOST     ?? '127.0.0.1',
  port:   Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  scheme: import.meta.env.VITE_REVERB_SCHEME   ?? 'http',
};

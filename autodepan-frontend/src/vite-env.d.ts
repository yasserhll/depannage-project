/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_API_URL:                     string;
  readonly VITE_STRIPE_PUBLIC_KEY:           string;
  readonly VITE_FIREBASE_API_KEY:            string;
  readonly VITE_FIREBASE_AUTH_DOMAIN:        string;
  readonly VITE_FIREBASE_PROJECT_ID:         string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID:             string;
  readonly VITE_FIREBASE_VAPID_KEY:          string;
  readonly VITE_OSRM_URL:                    string;
  readonly VITE_NOMINATIM_URL:               string;
  readonly VITE_APP_NAME:                    string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

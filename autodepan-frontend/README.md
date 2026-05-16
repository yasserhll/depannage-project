# AutoDepan — Frontend React PWA

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Stripe, Firebase, etc.

# 3. Lancer le serveur de développement
npm run dev
# → http://localhost:3000

# 4. Build production
npm run build
```

## Structure des routes

| Route | Rôle | Description |
|---|---|---|
| `/auth/connexion` | Public | Connexion |
| `/auth/inscription` | Public | Inscription client |
| `/auth/inscription/depanneur` | Public | Inscription dépanneur |
| `/client` | Client | Dashboard + carte |
| `/client/nouveau` | Client | Nouvelle demande |
| `/client/tracking/:uuid` | Client | Suivi GPS en temps réel |
| `/client/missions` | Client | Historique |
| `/client/chat/:uuid` | Client | Chat mission |
| `/depanneur` | Dépanneur | Dashboard + toggle dispo |
| `/depanneur/missions/:uuid` | Dépanneur | Mission active + navigation |
| `/depanneur/wallet` | Dépanneur | Wallet et revenus |
| `/depanneur/documents` | Dépanneur | Upload KYC |
| `/admin` | Admin | KPIs globaux |
| `/admin/kyc` | Admin | Validation dossiers |
| `/admin/gps-live` | Admin | Surveillance GPS temps réel |
| `/admin/litiges` | Admin | Gestion litiges |

## Variables d'environnement requises

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_FIREBASE_VAPID_KEY=...   # Pour push notifications
```

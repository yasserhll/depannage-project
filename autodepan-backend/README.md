# AutoDepan — Backend API (Laravel 11)

API REST + WebSockets temps réel pour l'application de dépannage automobile.

## Prérequis

- PHP 8.3+
- Composer 2
- MySQL 8.0+
- Redis 7+
- Node.js 20+ (pour Reverb)

## Installation

```bash
# 1. Dépendances
composer install

# 2. Environnement
cp .env.example .env
php artisan key:generate

# 3. Base de données
php artisan migrate --seed

# 4. Storage public
php artisan storage:link

# 5. Lancer les serveurs
php artisan serve                    # API (port 8000)
php artisan reverb:start             # WebSockets (port 8080)
php artisan horizon:start            # Queue worker
php artisan schedule:work            # Scheduler (dev)
```

## Variables d'environnement clés

| Variable | Description |
|---|---|
| `DB_*` | Connexion MySQL |
| `REDIS_*` | Connexion Redis |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `STRIPE_COMMISSION_RATE` | Taux commission (défaut: 0.10 = 10%) |
| `FIREBASE_SERVER_KEY` | Clé FCM pour les push notifications |
| `REVERB_APP_KEY/SECRET` | Credentials Laravel Reverb |
| `FRONTEND_URL` | URL du frontend (CORS) |
| `OSRM_URL` | Serveur OSRM (routage) |
| `ADMIN_PASSWORD` | Mot de passe admin initial |

## Structure des routes

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                        [auth]
POST   /api/auth/logout                    [auth]

GET    /api/client/dashboard               [auth, role:client]
POST   /api/client/missions                [auth, role:client]
GET    /api/client/missions/{uuid}         [auth, role:client]
POST   /api/client/missions/{uuid}/cancel  [auth, role:client]
POST   /api/client/missions/{uuid}/validate[auth, role:client]

GET    /api/depanneur/dashboard            [auth, role:depanneur]
GET    /api/depanneur/missions/pending     [auth, role:depanneur]
POST   /api/depanneur/missions/{uuid}/accept [auth, role:depanneur]
POST   /api/depanneur/gps/update           [auth, role:depanneur, throttle:gps]

GET    /api/admin/dashboard                [auth, role:admin]
GET    /api/admin/kyc/pending              [auth, role:admin]
POST   /api/admin/kyc/{id}/approve         [auth, role:admin]

POST   /api/stripe/webhook                 [public, signature Stripe]
```

## WebSockets (Laravel Reverb)

| Canal | Type | Événement |
|---|---|---|
| `mission.{uuid}` | Private | `gps.updated`, `mission.status_changed`, `chat.message` |
| `depanneur.{id}` | Private | `mission.new_request` |
| `user.{id}` | Private | notifications |
| `admin.dashboard` | Private | `gps.updated` (tous dépanneurs) |

## Commandes artisan utiles

```bash
php artisan missions:auto-validate   # Valider missions expirées
php artisan horizon:status           # Statut des queues
php artisan reverb:start --debug     # WebSockets en mode debug
```

## Tests

```bash
php artisan test
php artisan test --coverage
```

## Déploiement production

1. `composer install --optimize-autoloader --no-dev`
2. `php artisan config:cache && php artisan route:cache`
3. Configurer Supervisor pour Horizon + Reverb
4. Configurer le webhook Stripe vers `/api/stripe/webhook`
5. Configurer un cron : `* * * * * php artisan schedule:run`

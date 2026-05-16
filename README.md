# AutoDepan — Dépannage Automobile en Temps Réel

Application full-stack de mise en relation entre clients en panne et dépanneurs, avec suivi GPS temps réel, chat intégré, paiement Stripe et interface d'administration.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Laravel 11, PHP 8.2+ |
| Authentification | Laravel Sanctum |
| WebSocket | Laravel Reverb (protocole Pusher) |
| Paiement | Stripe (escrow) |
| Permissions | Spatie Laravel Permission |
| Frontend | React 18, TypeScript, Vite |
| État global | Redux Toolkit |
| Requêtes API | TanStack Query v5 |
| Carte | React-Leaflet / OpenStreetMap |
| Styles | Tailwind CSS |
| PWA | vite-plugin-pwa |

---

## Structure du projet

```
depannage-project/
├── autodepan-backend/    # API Laravel (backend principal)
└── autodepan-frontend/   # Application React/Vite (PWA)
```

---

## Prérequis

- PHP >= 8.2 + Composer
- Node.js >= 18 + npm
- MySQL 8+
- Compte Stripe (clés API)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/yasserhll/depannage-project.git
cd depannage-project
```

---

### 2. Backend (Laravel)

```bash
cd autodepan-backend

# Installer les dépendances PHP
composer install

# Copier et configurer l'environnement
cp .env.example .env
php artisan key:generate
```

Éditer `.env` avec tes valeurs :

```env
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=autodepan
DB_USERNAME=root
DB_PASSWORD=

STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

REVERB_APP_ID=autodepan
REVERB_APP_KEY=autodepan-key
REVERB_APP_SECRET=autodepan-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=6001
REVERB_SCHEME=http
```

```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE autodepan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Lancer les migrations et les seeders
php artisan migrate --seed

# Créer le lien de stockage public
php artisan storage:link
```

---

### 3. Frontend (React)

```bash
cd ../autodepan-frontend

# Installer les dépendances Node
npm install

# Copier et configurer l'environnement
cp .env.example .env
```

Éditer `.env` :

```env
VITE_API_URL=http://localhost:8000

VITE_REVERB_APP_KEY=autodepan-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=6001
VITE_REVERB_SCHEME=http

VITE_STRIPE_KEY=pk_test_...
```

---

## Lancement en développement

Ouvrir **3 terminaux** :

### Terminal 1 — Serveur Laravel
```bash
cd autodepan-backend
php artisan serve
# → http://localhost:8000
```

### Terminal 2 — WebSocket Reverb
```bash
cd autodepan-backend
php artisan reverb:start
# → ws://localhost:6001
```

### Terminal 3 — Frontend Vite
```bash
cd autodepan-frontend
npm run dev
# → http://localhost:3000
# → http://<IP-réseau>:3000  (accessible depuis mobile)
```

---

## Comptes par défaut (après seeding)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@autodepan.com | password |
| Client | client@autodepan.com | password |
| Dépanneur | depanneur@autodepan.com | password |

---

## Build de production

### Frontend

```bash
cd autodepan-frontend
npm run build
# Les fichiers sont générés dans dist/
```

### Backend

```bash
cd autodepan-backend

# Optimiser Laravel pour la production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

## Déploiement

### Serveur (VPS / cPanel)

#### Backend Laravel

1. Uploader le contenu de `autodepan-backend/` sur le serveur
2. Configurer le document root sur `public/`
3. Copier `.env.example` → `.env` et remplir les variables de production
4. Exécuter sur le serveur :

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

5. Lancer Reverb en arrière-plan avec Supervisor :

```ini
[program:reverb]
command=php /var/www/autodepan-backend/artisan reverb:start
autostart=true
autorestart=true
user=www-data
```

#### Frontend React

```bash
cd autodepan-frontend

# Mettre à jour .env avec les URLs de production
# VITE_API_URL=https://api.votre-domaine.com
# VITE_REVERB_HOST=api.votre-domaine.com
# VITE_REVERB_SCHEME=https
# VITE_REVERB_PORT=443

npm run build
# Uploader le contenu de dist/ sur le serveur web (Nginx/Apache)
```

Configuration Nginx minimale pour le frontend :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/autodepan-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Fonctionnalités principales

- **Client** : demande de dépannage, suivi GPS du dépanneur en temps réel, chat, paiement Stripe, historique
- **Dépanneur** : réception de missions, navigation GPS, chat client, portefeuille et retraits
- **Admin** : tableau de bord, gestion utilisateurs, validation KYC, suivi GPS global, litiges, paiements, commissions

---

## Variables d'environnement importantes

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET` | Clé secrète Stripe (backend) |
| `REVERB_APP_KEY` | Clé d'application Reverb |
| `REVERB_PORT` | Port WebSocket (6001 en dev) |
| `VITE_REVERB_HOST` | Hôte Reverb côté frontend |
| `VITE_STRIPE_KEY` | Clé publique Stripe (frontend) |

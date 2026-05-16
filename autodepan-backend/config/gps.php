<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OSRM — Routage open-source
    |--------------------------------------------------------------------------
    | URL du serveur OSRM. Utiliser l'instance publique pour le MVP,
    | puis migrer vers une instance auto-hébergée en production.
    */
    'osrm_url' => env('OSRM_URL', 'https://router.project-osrm.org'),

    /*
    |--------------------------------------------------------------------------
    | Nominatim — Géocodage OpenStreetMap
    |--------------------------------------------------------------------------
    */
    'nominatim_url' => env('NOMINATIM_URL', 'https://nominatim.openstreetmap.org'),

    /*
    |--------------------------------------------------------------------------
    | Anti-téléportation
    |--------------------------------------------------------------------------
    | Seuil en kilomètres au-delà duquel une mise à jour GPS est considérée
    | comme suspecte (dépanneur ne peut pas se déplacer de > 100 km en 1 update).
    */
    'teleport_threshold_km' => (int) env('GPS_TELEPORT_THRESHOLD_KM', 100),

    /*
    |--------------------------------------------------------------------------
    | Rayon de recherche par défaut
    |--------------------------------------------------------------------------
    */
    'default_radius_km' => (int) env('GPS_DEFAULT_RADIUS_KM', 50),

    /*
    |--------------------------------------------------------------------------
    | Cache TTL pour les routes OSRM (secondes)
    |--------------------------------------------------------------------------
    */
    'route_cache_ttl' => (int) env('GPS_ROUTE_CACHE_TTL', 60),

];

<?php

return [

    'secret'          => env('STRIPE_SECRET_KEY'),
    'public'          => env('STRIPE_PUBLIC_KEY'),
    'webhook_secret'  => env('STRIPE_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Commission plateforme
    |--------------------------------------------------------------------------
    | Pourcentage prélevé par AutoDepan sur chaque paiement libéré.
    | 0.10 = 10%
    */
    'commission_rate' => (float) env('STRIPE_COMMISSION_RATE', 0.10),

    /*
    |--------------------------------------------------------------------------
    | Devise par défaut
    |--------------------------------------------------------------------------
    */
    'currency'        => env('STRIPE_CURRENCY', 'eur'),

];

<?php

return [
    'name'            => env('APP_NAME', 'AutoDepan'),
    'env'             => env('APP_ENV', 'production'),
    'debug'           => (bool) env('APP_DEBUG', false),
    'url'             => env('APP_URL', 'http://localhost'),
    'timezone'        => env('APP_TIMEZONE', 'UTC'),
    'locale'          => env('APP_LOCALE', 'fr'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'fr'),
    'faker_locale'    => env('APP_FAKER_LOCALE', 'fr_FR'),
    'key'             => env('APP_KEY'),
    'cipher'          => 'AES-256-CBC',
    'maintenance'     => ['driver' => 'file'],
    'providers'       => Illuminate\Support\ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
    ])->toArray(),
    'aliases'         => Illuminate\Foundation\AliasLoader::getInstance()->getAliases(),
];

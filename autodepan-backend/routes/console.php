<?php

use App\Console\Commands\AutoValidateMissions;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Tâches planifiées
|--------------------------------------------------------------------------
*/

// Valider automatiquement les missions complétées depuis plus de 24h
Schedule::command(AutoValidateMissions::class)->everyFiveMinutes();

// Nettoyer les tokens FCM expirés
Schedule::call(function () {
    \App\Models\PushToken::where('updated_at', '<', now()->subMonths(3))->delete();
})->weekly();

// Purger les logs d'activité de plus de 6 mois
Schedule::call(function () {
    \App\Models\ActivityLog::where('created_at', '<', now()->subMonths(6))->delete();
})->monthly();

// Nettoyer les GPS locations de plus de 30 jours
Schedule::call(function () {
    \App\Models\GPSLocation::where('created_at', '<', now()->subDays(30))->delete();
})->daily();

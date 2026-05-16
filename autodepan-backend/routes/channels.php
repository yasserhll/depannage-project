<?php

use App\Models\Mission;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Canal mission.{uuid}  — client ET dépanneur de la mission
|--------------------------------------------------------------------------
*/
Broadcast::channel('mission.{uuid}', function ($user, string $uuid) {
    $mission = Mission::where('uuid', $uuid)->first();

    if (!$mission) {
        return false;
    }

    return $user->id === $mission->client_id
        || $user->id === $mission->depanneur_id
        || $user->role === 'admin';
});

/*
|--------------------------------------------------------------------------
| Canal depanneur.{id}  — le dépanneur lui-même uniquement
|--------------------------------------------------------------------------
*/
Broadcast::channel('depanneur.{id}', function ($user, int $id) {
    return $user->id === $id && $user->role === 'depanneur';
});

/*
|--------------------------------------------------------------------------
| Canal user.{id}  — notifications personnelles
|--------------------------------------------------------------------------
*/
Broadcast::channel('user.{id}', function ($user, int $id) {
    return $user->id === $id;
});

/*
|--------------------------------------------------------------------------
| Canal admin.dashboard  — admin uniquement (public broadcast)
|--------------------------------------------------------------------------
*/
Broadcast::channel('admin.dashboard', function ($user) {
    return $user->role === 'admin';
});

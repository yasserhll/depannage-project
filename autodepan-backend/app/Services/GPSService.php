<?php

namespace App\Services;

use App\Events\GPSPositionUpdated;
use App\Models\DepanneurProfile;
use App\Models\GPSLocation;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class GPSService
{
    public function __construct(private readonly OSRMService $osrm) {}

    public function updateDepanneurPosition(
        User $depanneur,
        float $lat,
        float $lng,
        ?float $accuracy = null,
        ?float $speed = null,
        ?float $heading = null,
    ): void {
        // Validation anti-téléportation
        $profile = $depanneur->depanneurProfile;
        if ($profile?->current_lat && $profile?->current_lng) {
            $dist = $this->haversine($profile->current_lat, $profile->current_lng, $lat, $lng);
            if ($dist > config('gps.teleport_threshold_km', 100)) {
                Log::warning('[GPS] Teleportation detected', [
                    'user_id'  => $depanneur->id,
                    'from'     => [$profile->current_lat, $profile->current_lng],
                    'to'       => [$lat, $lng],
                    'dist_km'  => $dist,
                ]);
                return;
            }
        }

        // Mise à jour position courante (dépanneur)
        $depanneur->update(['last_lat' => $lat, 'last_lng' => $lng]);
        $profile?->updateLocation($lat, $lng);

        // Trouver mission active
        $mission = Mission::where('depanneur_id', $depanneur->id)
            ->whereIn('status', ['accepted', 'en_route', 'arrived', 'in_progress'])
            ->first();

        if (!$mission) {
            return;
        }

        // Persister en BDD (batch: Redis buffer → flush toutes les 5s via Job)
        $this->bufferGPSLocation($mission->id, $depanneur->id, $lat, $lng, $accuracy, $speed, $heading);

        // Calculer route et ETA
        $routing = $this->osrm->estimateDistance($lat, $lng, $mission->client_lat, $mission->client_lng);

        // Broadcast WebSocket en temps réel
        broadcast(new GPSPositionUpdated(
            mission:          $mission,
            lat:              $lat,
            lng:              $lng,
            etaMinutes:       $routing['duration_minutes'] ?? null,
            distanceKm:       $routing['distance_km'] ?? null,
            route:            $routing['polyline_coords'] ?? null,
        ))->toOthers();
    }

    public function getNearbyDepanneurs(float $lat, float $lng, int $radiusKm = 20): array
    {
        // Requête avec distance Haversine (MySQL)
        return DepanneurProfile::query()
            ->select('depanneur_profiles.*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(current_lat)) '
                . '* cos(radians(current_lng) - radians(?)) '
                . '+ sin(radians(?)) * sin(radians(current_lat)))) AS distance_km',
                [$lat, $lng, $lat],
            )
            ->where('is_available', true)
            ->where('is_kyc_verified', true)
            ->whereNotNull('current_lat')
            ->whereNotNull('current_lng')
            ->whereRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(current_lat)) '
                . '* cos(radians(current_lng) - radians(?)) '
                . '+ sin(radians(?)) * sin(radians(current_lat)))) <= ?',
                [$lat, $lng, $lat, $radiusKm],
            )
            ->having('distance_km', '<=', $radiusKm)
            ->orderBy('distance_km')
            ->limit(20)
            ->with('user:id,name,avatar,phone')
            ->get()
            ->map(fn($profile) => [
                'user_id'         => $profile->user_id,
                'name'            => $profile->user->name,
                'avatar'          => $profile->user->avatar,
                'phone'           => $profile->user->phone,
                'rating_avg'      => (float) $profile->rating_avg,
                'distance_km'     => round((float) $profile->distance_km, 2),
                'eta_minutes'     => (int) ceil((float) $profile->distance_km * 2), // ~30 km/h
                'current_lat'     => (float) $profile->current_lat,
                'current_lng'     => (float) $profile->current_lng,
                'specializations' => $profile->specializations ?? [],
                'vehicle_type'    => $profile->vehicle_type,
            ])
            ->values()
            ->all();
    }

    private function bufferGPSLocation(
        int $missionId, int $userId,
        float $lat, float $lng,
        ?float $accuracy, ?float $speed, ?float $heading,
    ): void {
        // Flush direct en MVP — en production : utiliser un buffer Redis + Job batch
        GPSLocation::create([
            'mission_id' => $missionId,
            'user_id'    => $userId,
            'lat'        => $lat,
            'lng'        => $lng,
            'accuracy'   => $accuracy,
            'speed'      => $speed,
            'heading'    => $heading,
        ]);
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * asin(sqrt($a));
    }
}

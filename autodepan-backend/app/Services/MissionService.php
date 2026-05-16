<?php

namespace App\Services;

use App\Events\MissionStatusChanged;
use App\Events\NewMissionRequest;
use App\Models\DepanneurProfile;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MissionService
{
    public function __construct(
        private readonly GPSService          $gps,
        private readonly OSRMService         $osrm,
        private readonly NotificationService $notifications,
    ) {}

    public function createMission(User $client, array $data): Mission
    {
        $mission = Mission::create([
            ...$data,
            'client_id'       => $client->id,
            'status'          => 'searching',
            'auto_validate_at' => now()->addHours(24),
        ]);

        // Notifier les dépanneurs proches
        $this->dispatchToNearbyDepanneurs($mission);

        return $mission;
    }

    public function acceptMission(Mission $mission, User $depanneur): Mission
    {
        if ($mission->status !== 'searching') {
            abort(409, 'Cette mission a déjà été acceptée.');
        }

        // Calculer distance et ETA
        $routing = $this->osrm->estimateDistance(
            $depanneur->depanneurProfile->current_lat ?? $depanneur->last_lat ?? 0,
            $depanneur->depanneurProfile->current_lng ?? $depanneur->last_lng ?? 0,
            $mission->client_lat,
            $mission->client_lng,
        );

        DB::transaction(function () use ($mission, $depanneur, $routing) {
            $mission->update([
                'depanneur_id'          => $depanneur->id,
                'status'                => 'accepted',
                'accepted_at'           => now(),
                'distance_km'           => $routing['distance_km'] ?? null,
                'estimated_duration_min' => $routing['duration_minutes'] ?? null,
            ]);

            // Dépanneur devient indisponible
            $depanneur->depanneurProfile?->update(['is_available' => false]);
        });

        // Broadcast + notification client
        broadcast(new MissionStatusChanged($mission, 'accepted'))->toOthers();
        $this->notifications->missionAccepted(
            $mission->client,
            $mission->uuid,
            $depanneur->name,
        );

        return $mission->fresh(['client', 'depanneur.depanneurProfile']);
    }

    public function transitionStatus(Mission $mission, string $newStatus, ?User $actor = null): Mission
    {
        $mission->transitionTo($newStatus);

        broadcast(new MissionStatusChanged($mission, $newStatus))->toOthers();

        match ($newStatus) {
            'en_route'    => $this->notifications->depanneurEnRoute($mission->client, $mission->uuid, $mission->estimated_duration_min ?? 10),
            'arrived'     => $this->notifications->depanneurArrived($mission->client, $mission->uuid),
            'completed'   => $this->notifications->missionCompleted($mission->client, $actor ?? $mission->depanneur, $mission->uuid),
            default       => null,
        };

        return $mission->fresh();
    }

    private function dispatchToNearbyDepanneurs(Mission $mission): void
    {
        $nearby = $this->gps->getNearbyDepanneurs($mission->client_lat, $mission->client_lng);

        foreach ($nearby as $dep) {
            $user = User::find($dep['user_id']);
            if (!$user) continue;

            // Broadcast WebSocket au dépanneur
            broadcast(new NewMissionRequest($mission, $dep))->toOthers();

            // Notification push
            $this->notifications->newMissionRequest($user, array_merge(
                ['mission_uuid' => $mission->uuid],
                $dep,
                ['breakdown_type' => $mission->breakdown_type],
            ));
        }
    }
}

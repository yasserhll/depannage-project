<?php

namespace App\Services;

use App\Jobs\SendPushNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Notification in-app + push
     */
    public function notify(User $user, string $type, array $data, bool $push = true): void
    {
        // In-app (DB notifications Laravel)
        $user->notifications()->create([
            'id'   => \Illuminate\Support\Str::uuid(),
            'type' => $type,
            'data' => $data,
        ]);

        // Push notification
        if ($push && isset($data['title'], $data['body'])) {
            dispatch(new SendPushNotification(
                userId: $user->id,
                title:  $data['title'],
                body:   $data['body'],
                data:   $data,
            ));
        }
    }

    public function missionAccepted(User $client, string $missionUuid, string $depanneurName): void
    {
        $this->notify($client, 'mission.accepted', [
            'title'        => '✅ Dépanneur trouvé !',
            'body'         => "{$depanneurName} a accepté votre demande.",
            'mission_uuid' => $missionUuid,
            'action'       => 'open_tracking',
        ]);
    }

    public function depanneurEnRoute(User $client, string $missionUuid, int $etaMinutes): void
    {
        $this->notify($client, 'mission.en_route', [
            'title'        => '🚗 Le dépanneur est en route',
            'body'         => "Arrivée estimée dans {$etaMinutes} minutes.",
            'mission_uuid' => $missionUuid,
        ]);
    }

    public function depanneurArrived(User $client, string $missionUuid): void
    {
        $this->notify($client, 'mission.arrived', [
            'title'        => '📍 Le dépanneur est arrivé',
            'body'         => 'Il est sur place, l\'intervention va commencer.',
            'mission_uuid' => $missionUuid,
        ]);
    }

    public function missionCompleted(User $client, User $depanneur, string $missionUuid): void
    {
        $this->notify($client, 'mission.completed', [
            'title'        => '✔️ Mission terminée',
            'body'         => 'Veuillez confirmer la fin de la mission.',
            'mission_uuid' => $missionUuid,
        ]);

        $this->notify($depanneur, 'mission.completed', [
            'title'        => '✔️ Mission terminée',
            'body'         => 'Le paiement sera libéré après validation du client.',
            'mission_uuid' => $missionUuid,
        ], push: false);
    }

    public function kycApproved(User $depanneur): void
    {
        $this->notify($depanneur, 'kyc.approved', [
            'title' => '🎉 Compte validé !',
            'body'  => 'Votre dossier KYC a été approuvé. Vous pouvez maintenant recevoir des missions.',
        ]);
    }

    public function kycRejected(User $depanneur, string $reason): void
    {
        $this->notify($depanneur, 'kyc.rejected', [
            'title' => '❌ Dossier KYC rejeté',
            'body'  => "Raison : {$reason}. Veuillez resoumettre vos documents.",
        ]);
    }

    public function newMissionRequest(User $depanneur, array $missionData): void
    {
        $this->notify($depanneur, 'mission.new_request', array_merge($missionData, [
            'title' => '🚨 Nouvelle demande de dépannage !',
            'body'  => "Panne : {$missionData['breakdown_type']} · {$missionData['distance_km']} km",
        ]));
    }
}

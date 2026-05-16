<?php

namespace App\Jobs;

use App\Models\PushToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 30;

    public function __construct(
        private readonly int    $userId,
        private readonly string $title,
        private readonly string $body,
        private readonly array  $data = [],
    ) {}

    public function handle(): void
    {
        $tokens = PushToken::where('user_id', $this->userId)
            ->pluck('token')
            ->all();

        if (empty($tokens)) {
            return;
        }

        $fcmServerKey = config('services.fcm.server_key');
        if (!$fcmServerKey) {
            Log::warning('[FCM] Server key not configured');
            return;
        }

        // Payload FCM v1 (HTTP API)
        foreach ($tokens as $token) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => "key={$fcmServerKey}",
                    'Content-Type'  => 'application/json',
                ])->post('https://fcm.googleapis.com/fcm/send', [
                    'to' => $token,
                    'notification' => [
                        'title' => $this->title,
                        'body'  => $this->body,
                        'icon'  => '/icons/icon-192x192.png',
                        'badge' => '/icons/badge-72x72.png',
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ],
                    'data' => $this->data,
                ]);

                if (!$response->ok()) {
                    Log::warning('[FCM] Send failed', [
                        'token'    => substr($token, 0, 20) . '…',
                        'response' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('[FCM] Exception', ['error' => $e->getMessage()]);
            }
        }
    }
}

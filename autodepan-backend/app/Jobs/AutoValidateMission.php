<?php

namespace App\Jobs;

use App\Models\Mission;
use App\Services\StripeEscrowService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AutoValidateMission implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(private readonly int $missionId) {}

    public function handle(StripeEscrowService $escrow): void
    {
        $mission = Mission::with(['payment'])->find($this->missionId);

        if (!$mission || $mission->status !== 'completed') {
            return; // Déjà validé ou annulé
        }

        // Auto-validation : libérer le paiement
        $payment = $mission->payment;
        if ($payment && $payment->status === 'captured') {
            try {
                $escrow->releaseToDepanneur($payment);
                Log::info('[AutoValidate] Payment released', ['mission_id' => $mission->id]);
            } catch (\Throwable $e) {
                Log::error('[AutoValidate] Failed', [
                    'mission_id' => $mission->id,
                    'error'      => $e->getMessage(),
                ]);
                throw $e;
            }
        }
    }
}

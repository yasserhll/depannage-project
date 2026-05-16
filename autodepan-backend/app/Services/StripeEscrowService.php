<?php

namespace App\Services;

use App\Jobs\SendPushNotification;
use App\Models\Commission;
use App\Models\Mission;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeEscrowService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('stripe.secret'));
    }

    /**
     * Étape 1 : Créer un PaymentIntent avec capture manuelle (ESCROW)
     * Retourne un tableau avec client_secret, payment_intent_id et l'objet Payment
     */
    public function createPaymentIntent(Mission $mission, float $amount): array
    {
        $amountCents = (int) round($amount * 100);

        $intent = $this->stripe->paymentIntents->create([
            'amount'              => $amountCents,
            'currency'            => strtolower($mission->currency ?? 'eur'),
            'capture_method'      => 'manual',           // ← Clé escrow
            'confirmation_method' => 'manual',
            'metadata'            => [
                'mission_uuid' => $mission->uuid,
                'client_id'    => $mission->client_id,
                'platform'     => 'autodepan',
            ],
        ]);

        $payment = Payment::create([
            'mission_id'                => $mission->id,
            'client_id'                 => $mission->client_id,
            'stripe_payment_intent_id'  => $intent->id,
            'amount'                    => $amount,
            'currency'                  => strtoupper($mission->currency ?? 'EUR'),
            'status'                    => 'pending',
        ]);

        return [
            'client_secret'     => $intent->client_secret,
            'payment_intent_id' => $intent->id,
            'payment'           => $payment,
        ];
    }

    /**
     * Étape 2 : Capturer (fonds bloqués mais non transférés)
     */
    public function capturePayment(Payment $payment): void
    {
        $this->stripe->paymentIntents->capture($payment->stripe_payment_intent_id);
        $payment->update(['status' => 'captured', 'authorized_at' => now()]);

        Log::info('[Stripe] Payment captured', ['payment_id' => $payment->id]);
    }

    /**
     * Étape 3 : Libérer au dépanneur (90%) + commission plateforme (10%)
     */
    public function releaseToDepanneur(Payment $payment): void
    {
        $mission        = $payment->mission()->with(['depanneur.depanneurProfile'])->firstOrFail();
        $commissionRate = (float) config('stripe.commission_rate', 10) / 100;
        $platformFee    = round((float) $payment->amount * $commissionRate, 2);
        $depanneurNet   = round((float) $payment->amount - $platformFee, 2);

        $stripeAccountId = $mission->depanneur?->depanneurProfile?->stripe_account_id;

        DB::transaction(function () use ($payment, $mission, $platformFee, $depanneurNet, $stripeAccountId) {
            // Stripe Transfer si compte Connect configuré
            $reference = null;
            if ($stripeAccountId) {
                try {
                    $transfer  = $this->stripe->transfers->create([
                        'amount'      => (int) ($depanneurNet * 100),
                        'currency'    => 'eur',
                        'destination' => $stripeAccountId,
                        'metadata'    => ['mission_uuid' => $mission->uuid],
                    ]);
                    $reference = $transfer->id;
                } catch (ApiErrorException $e) {
                    Log::error('[Stripe] Transfer failed', [
                        'mission' => $mission->uuid,
                        'error'   => $e->getMessage(),
                    ]);
                }
            }

            // Mise à jour paiement
            $payment->update([
                'status'           => 'released',
                'platform_fee'     => $platformFee,
                'depanneur_amount' => $depanneurNet,
                'released_at'      => now(),
            ]);

            // Commission
            Commission::create([
                'mission_id'        => $mission->id,
                'payment_id'        => $payment->id,
                'gross_amount'      => $payment->amount,
                'rate'              => config('stripe.commission_rate', 10),
                'commission_amount' => $platformFee,
                'net_amount'        => $depanneurNet,
            ]);

            // Wallet dépanneur
            $wallet = $mission->depanneur->getOrCreateWallet();
            $wallet->credit(
                amount:      $depanneurNet,
                description: "Mission #{$mission->uuid} — Paiement libéré",
                missionId:   $mission->id,
                reference:   $reference,
            );
        });

        // Notification push dépanneur
        dispatch(new SendPushNotification(
            userId:  $mission->depanneur_id,
            title:   '💰 Paiement reçu !',
            body:    "Mission terminée — {$depanneurNet}€ disponibles dans votre wallet",
            data:    ['type' => 'payment_received', 'mission_uuid' => $mission->uuid],
        ));

        Log::info('[Stripe] Payment released', [
            'payment_id'     => $payment->id,
            'depanneur_net'  => $depanneurNet,
            'platform_fee'   => $platformFee,
        ]);
    }

    /**
     * Rembourser le client
     */
    public function refundClient(Payment $payment, ?float $amount = null, string $reason = ''): void
    {
        $refundAmount = $amount ? (int) ($amount * 100) : null;

        $refund = $this->stripe->refunds->create(array_filter([
            'payment_intent' => $payment->stripe_payment_intent_id,
            'amount'         => $refundAmount,
            'reason'         => 'requested_by_customer',
        ]));

        $payment->update([
            'status'         => $amount && $amount < (float) $payment->amount ? 'partially_refunded' : 'refunded',
            'refunded_at'    => now(),
            'refund_reason'  => $reason,
        ]);

        Log::info('[Stripe] Refund issued', ['refund_id' => $refund->id]);
    }
}

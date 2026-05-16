<?php

namespace App\Http\Controllers\Api\Payment;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class WebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $secret  = config('stripe.webhook_secret');
        $payload = $request->getContent();
        $sig     = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sig, $secret);
        } catch (SignatureVerificationException $e) {
            ActivityLog::record('stripe.webhook.invalid_signature', null);
            return response('Signature invalide.', 400);
        }

        match ($event->type) {
            'payment_intent.amount_capturable_updated' => $this->onAuthorized($event->data->object),
            'payment_intent.succeeded'                 => $this->onCaptured($event->data->object),
            'payment_intent.payment_failed'            => $this->onFailed($event->data->object),
            'charge.refunded'                          => $this->onRefunded($event->data->object),
            default                                    => null,
        };

        return response('OK', 200);
    }

    private function onAuthorized(object $intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();

        if ($payment && $payment->status === 'pending') {
            $payment->update([
                'status'        => 'authorized',
                'authorized_at' => now(),
            ]);
        }
    }

    private function onCaptured(object $intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();

        if ($payment) {
            $payment->update([
                'status'      => 'captured',
                'captured_at' => now(),
            ]);
        }
    }

    private function onFailed(object $intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();

        if ($payment) {
            $payment->update(['status' => 'failed']);

            ActivityLog::record('stripe.payment_failed', null, Payment::class, $payment->id, [], [
                'intent_id'       => $intent->id,
                'failure_message' => $intent->last_payment_error?->message ?? 'unknown',
            ]);
        }
    }

    private function onRefunded(object $charge): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $charge->payment_intent)->first();

        if ($payment) {
            $payment->update([
                'status'      => 'refunded',
                'refunded_at' => now(),
            ]);
        }
    }
}

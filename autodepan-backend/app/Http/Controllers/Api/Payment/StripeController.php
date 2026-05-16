<?php

namespace App\Http\Controllers\Api\Payment;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Mission;
use App\Services\StripeEscrowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StripeController extends Controller
{
    public function createIntent(Request $request, StripeEscrowService $stripe): JsonResponse
    {
        $request->validate([
            'mission_uuid' => 'required|string',
            'amount'       => 'required|numeric|min:1',
        ]);

        $mission = Mission::where('uuid', $request->mission_uuid)
            ->where('client_id', $request->user()->id)
            ->firstOrFail();

        if ($mission->payment) {
            throw new ApiException('Un paiement existe déjà pour cette mission.', 'PAYMENT_EXISTS', 422);
        }

        $result = $stripe->createPaymentIntent($mission, $request->amount);

        return response()->json([
            'client_secret'      => $result['client_secret'],
            'payment_intent_id'  => $result['payment_intent_id'],
            'payment'            => new PaymentResource($result['payment']),
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'mission_uuid'       => 'required|string',
            'payment_intent_id'  => 'required|string',
        ]);

        $mission = Mission::where('uuid', $request->mission_uuid)
            ->where('client_id', $request->user()->id)
            ->with('payment')
            ->firstOrFail();

        if (!$mission->payment) {
            throw new ApiException('Paiement introuvable.', 'PAYMENT_NOT_FOUND', 404);
        }

        $mission->payment->update([
            'status'         => 'authorized',
            'authorized_at'  => now(),
        ]);

        return response()->json([
            'message' => 'Paiement autorisé. Fonds réservés jusqu\'à la validation.',
            'payment' => new PaymentResource($mission->payment->fresh()),
        ]);
    }
}

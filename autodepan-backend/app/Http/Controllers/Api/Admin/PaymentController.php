<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Services\StripeEscrowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['mission', 'client']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->paginate(30);

        return response()->json([
            'payments'   => PaymentResource::collection($payments->items()),
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page'    => $payments->lastPage(),
                'total'        => $payments->total(),
            ],
        ]);
    }

    public function release(Request $request, int $id, StripeEscrowService $stripe): JsonResponse
    {
        $payment = Payment::with('mission')->findOrFail($id);

        if ($payment->status === 'released') {
            throw new ApiException('Paiement déjà libéré.', 'ALREADY_RELEASED', 422);
        }

        if (!in_array($payment->status, ['captured', 'authorized'])) {
            throw new ApiException('Ce paiement ne peut pas être libéré.', 'INVALID_STATUS', 422);
        }

        $stripe->releaseToDepanneur($payment);

        ActivityLog::record('payment.released', $request->user()->id, Payment::class, $payment->id);

        return response()->json(['message' => 'Paiement libéré au dépanneur.']);
    }

    public function refund(Request $request, int $id, StripeEscrowService $stripe): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $payment = Payment::with('mission')->findOrFail($id);

        if ($payment->status === 'refunded') {
            throw new ApiException('Paiement déjà remboursé.', 'ALREADY_REFUNDED', 422);
        }

        $stripe->refundClient($payment, null, $request->reason);

        ActivityLog::record('payment.refunded', $request->user()->id, Payment::class, $payment->id);

        return response()->json(['message' => 'Remboursement effectué.']);
    }
}

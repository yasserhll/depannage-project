<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Dispute;
use App\Models\Mission;
use App\Services\StripeEscrowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DisputeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Dispute::with(['mission.client', 'mission.depanneur', 'openedBy']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $disputes = $query->latest()->paginate(20);

        return response()->json([
            'disputes'   => $disputes->items(),
            'pagination' => [
                'current_page' => $disputes->currentPage(),
                'last_page'    => $disputes->lastPage(),
                'total'        => $disputes->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $dispute = Dispute::with([
            'mission.client',
            'mission.depanneur',
            'mission.payment',
            'openedBy',
            'resolvedBy',
        ])->findOrFail($id);

        return response()->json(['dispute' => $dispute]);
    }

    public function resolve(Request $request, int $id, StripeEscrowService $stripe): JsonResponse
    {
        $request->validate([
            'resolution'      => 'required|in:refund_client,release_depanneur,partial_refund',
            'refund_amount'   => 'required_if:resolution,partial_refund|numeric|min:0',
            'admin_note'      => 'required|string|max:1000',
        ]);

        $dispute = Dispute::with('mission.payment')->findOrFail($id);

        if ($dispute->status === 'resolved') {
            throw new ApiException('Ce litige est déjà résolu.', 'ALREADY_RESOLVED', 422);
        }

        $mission = $dispute->mission;
        $payment = $mission->payment;

        if ($payment) {
            match ($request->resolution) {
                'refund_client'     => $stripe->refundClient($payment, null, $request->admin_note),
                'release_depanneur' => $stripe->releaseToDepanneur($payment),
                'partial_refund'    => $stripe->refundClient($payment, (float) $request->refund_amount, $request->admin_note),
            };
        }

        $dispute->update([
            'status'          => 'resolved',
            'resolution_note' => $request->admin_note . ' [' . $request->resolution . ']',
            'refund_amount'   => $request->refund_amount,
            'resolved_by'     => $request->user()->id,
            'resolved_at'     => now(),
        ]);

        ActivityLog::record('dispute.resolved', $request->user()->id, Dispute::class, $dispute->id);

        return response()->json(['message' => 'Litige résolu.']);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:open,under_review,awaiting_evidence,resolved,closed']);

        $dispute = Dispute::findOrFail($id);
        $dispute->update(['status' => $request->status]);

        return response()->json(['message' => 'Statut mis à jour.']);
    }
}

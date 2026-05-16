<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\DepanneurProfile;
use App\Models\Document;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KYCController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function pending(Request $request): JsonResponse
    {
        $profiles = DepanneurProfile::where('kyc_status', 'in_review')
            ->with(['user.documents'])
            ->paginate(20);

        $items = $profiles->items();

        return response()->json([
            'profiles'   => collect($items)->map(fn($p) => [
                'id'           => $p->id,
                'kyc_status'   => $p->kyc_status,
                'business_name'=> $p->business_name,
                'user'         => new UserResource($p->user),
                'documents'    => DocumentResource::collection($p->user->documents),
            ]),
            'pagination' => [
                'current_page' => $profiles->currentPage(),
                'last_page'    => $profiles->lastPage(),
                'total'        => $profiles->total(),
            ],
        ]);
    }

    public function approve(Request $request, int $userId): JsonResponse
    {
        $user    = User::findOrFail($userId);
        $profile = $user->depanneurProfile;

        $profile->update([
            'kyc_status'       => 'approved',
            'is_kyc_verified'  => true,
            'kyc_reviewed_at'  => now(),
            'kyc_reviewed_by'  => $request->user()->id,
        ]);

        $user->documents()
            ->where('status', 'pending')
            ->update(['status' => 'approved', 'reviewed_at' => now(), 'reviewed_by' => $request->user()->id]);

        $this->notifications->kycApproved($user);

        ActivityLog::record('kyc.approved', $request->user()->id, User::class, $user->id);

        return response()->json(['message' => "KYC de {$user->name} approuvé."]);
    }

    public function reject(Request $request, int $userId): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $user    = User::findOrFail($userId);
        $profile = $user->depanneurProfile;

        $profile->update([
            'kyc_status'      => 'rejected',
            'is_kyc_verified' => false,
            'kyc_reviewed_at' => now(),
            'kyc_reviewed_by' => $request->user()->id,
            'kyc_notes'       => $request->reason,
        ]);

        $this->notifications->kycRejected($user, $request->reason);

        ActivityLog::record('kyc.rejected', $request->user()->id, User::class, $user->id);

        return response()->json(['message' => "KYC de {$user->name} rejeté."]);
    }

    public function approveDocument(Request $request, int $docId): JsonResponse
    {
        $document = Document::findOrFail($docId);

        $document->update([
            'status'      => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message'  => 'Document approuvé.',
            'document' => new DocumentResource($document),
        ]);
    }

    public function rejectDocument(Request $request, int $docId): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $document = Document::findOrFail($docId);

        $document->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
            'reviewed_at'      => now(),
            'reviewed_by'      => $request->user()->id,
        ]);

        return response()->json([
            'message'  => 'Document rejeté.',
            'document' => new DocumentResource($document),
        ]);
    }
}

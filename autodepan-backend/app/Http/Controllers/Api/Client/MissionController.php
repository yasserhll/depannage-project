<?php

namespace App\Http\Controllers\Api\Client;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Mission\CreateMissionRequest;
use App\Http\Resources\MissionResource;
use App\Models\Mission;
use App\Services\MissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function __construct(private readonly MissionService $missionService) {}

    public function index(Request $request): JsonResponse
    {
        $missions = $request->user()
            ->clientMissions()
            ->with(['depanneur', 'payment'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'missions'   => MissionResource::collection($missions->items()),
            'pagination' => [
                'current_page' => $missions->currentPage(),
                'last_page'    => $missions->lastPage(),
                'total'        => $missions->total(),
            ],
        ]);
    }

    public function store(CreateMissionRequest $request): JsonResponse
    {
        $activeMission = $request->user()
            ->clientMissions()
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->exists();

        if ($activeMission) {
            throw new ApiException(
                'Vous avez déjà une mission en cours.',
                'MISSION_ALREADY_ACTIVE',
                422
            );
        }

        $mission = $this->missionService->createMission($request->user(), $request->validated());

        return response()->json([
            'message' => 'Mission créée avec succès.',
            'mission' => new MissionResource($mission->load(['client', 'payment'])),
        ], 201);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->where('client_id', $request->user()->id)
            ->with(['client', 'depanneur.depanneurProfile', 'photos', 'payment', 'dispute'])
            ->firstOrFail();

        return response()->json(['mission' => new MissionResource($mission)]);
    }

    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $mission = Mission::where('uuid', $uuid)
            ->where('client_id', $request->user()->id)
            ->firstOrFail();

        if (!in_array($mission->status, ['searching', 'accepted'])) {
            throw new ApiException(
                'La mission ne peut plus être annulée.',
                'MISSION_NOT_CANCELLABLE',
                422
            );
        }

        $mission->update([
            'cancellation_reason' => $request->reason,
            'cancelled_by'        => 'client',
        ]);
        $this->missionService->transitionStatus($mission, 'cancelled');

        return response()->json(['message' => 'Mission annulée.']);
    }

    public function validate(Request $request, string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->where('client_id', $request->user()->id)
            ->where('status', 'completed')
            ->firstOrFail();

        if ($mission->payment?->status === 'released') {
            throw new ApiException('Cette mission a déjà été validée.', 'ALREADY_VALIDATED', 422);
        }

        if ($mission->payment) {
            app(\App\Services\StripeEscrowService::class)->releaseToDepanneur($mission->payment);
        }

        return response()->json(['message' => 'Mission validée. Paiement libéré au dépanneur.']);
    }

    public function dispute(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $mission = Mission::where('uuid', $uuid)
            ->where('client_id', $request->user()->id)
            ->whereIn('status', ['completed', 'in_progress'])
            ->firstOrFail();

        if ($mission->dispute) {
            throw new ApiException('Un litige est déjà ouvert.', 'DISPUTE_EXISTS', 422);
        }

        $mission->dispute()->create([
            'opened_by'       => $request->user()->id,
            'opened_by_type'  => 'client',
            'reason'          => $request->reason,
            'status'          => 'open',
        ]);

        $this->missionService->transitionStatus($mission, 'disputed');

        return response()->json(['message' => 'Litige ouvert. Notre équipe va examiner votre demande.']);
    }

    public function uploadPhotos(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'photos'   => 'required|array|max:5',
            'photos.*' => 'image|mimes:jpg,jpeg,png|max:5120',
            'type'     => 'required|in:before,after,damage',
        ]);

        $mission = Mission::where('uuid', $uuid)
            ->where('client_id', $request->user()->id)
            ->firstOrFail();

        $photos = [];
        foreach ($request->file('photos') as $file) {
            $path = $file->store("missions/{$mission->uuid}/photos", 'public');
            $photos[] = $mission->photos()->create([
                'uploaded_by' => $request->user()->id,
                'file_path'   => $path,
                'type'        => $request->type,
            ]);
        }

        return response()->json([
            'message' => count($photos) . ' photo(s) téléchargée(s).',
            'photos'  => \App\Http\Resources\MissionPhotoResource::collection($photos),
        ]);
    }

    public function tracking(Request $request, string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->where('client_id', $request->user()->id)
            ->with(['depanneur.depanneurProfile'])
            ->firstOrFail();

        $lastGPS = $mission->latestGPS;

        return response()->json([
            'mission_status' => $mission->status,
            'depanneur'      => $mission->depanneur ? [
                'id'            => $mission->depanneur->id,
                'name'          => $mission->depanneur->name,
                'avatar'        => $mission->depanneur->avatar,
                'phone'         => $mission->depanneur->phone,
                'rating_avg'    => $mission->depanneur->depanneurProfile?->rating_avg,
                'vehicle_type'  => $mission->depanneur->depanneurProfile?->vehicle_type,
                'vehicle_model' => $mission->depanneur->depanneurProfile?->vehicle_model,
                'current_lat'   => $lastGPS ? (float) $lastGPS->lat : null,
                'current_lng'   => $lastGPS ? (float) $lastGPS->lng : null,
            ] : null,
            'distance_km'            => $mission->distance_km,
            'estimated_duration_min' => $mission->estimated_duration_min,
        ]);
    }
}

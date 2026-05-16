<?php

namespace App\Http\Controllers\Api\Depanneur;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
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
            ->depanneurMissions()
            ->with(['client', 'payment'])
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

    public function show(Request $request, string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->where('depanneur_id', $request->user()->id)
            ->with(['client', 'photos', 'payment'])
            ->firstOrFail();

        return response()->json(['mission' => new MissionResource($mission)]);
    }

    public function accept(Request $request, string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->where('status', 'searching')
            ->firstOrFail();

        $user = $request->user();

        if (!$user->depanneurProfile?->is_kyc_verified) {
            throw new ApiException('Votre KYC doit être validé.', 'KYC_REQUIRED', 403);
        }

        if (!$user->depanneurProfile->is_available) {
            throw new ApiException('Vous devez être disponible pour accepter des missions.', 'NOT_AVAILABLE', 422);
        }

        $this->missionService->acceptMission($mission, $user);

        return response()->json([
            'message' => 'Mission acceptée.',
            'mission' => new MissionResource($mission->fresh(['client', 'payment'])),
        ]);
    }

    public function arrive(Request $request, string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->where('depanneur_id', $request->user()->id)
            ->where('status', 'en_route')
            ->firstOrFail();

        $this->missionService->transitionStatus($mission, 'arrived');

        return response()->json(['message' => 'Arrivée confirmée.']);
    }

    public function start(Request $request, string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->where('depanneur_id', $request->user()->id)
            ->where('status', 'arrived')
            ->firstOrFail();

        $this->missionService->transitionStatus($mission, 'in_progress');

        // Capturer le paiement (début des travaux)
        if ($mission->payment) {
            app(\App\Services\StripeEscrowService::class)->capturePayment($mission->payment);
        }

        return response()->json(['message' => 'Intervention démarrée.']);
    }

    public function complete(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['notes' => 'nullable|string|max:1000']);

        $mission = Mission::where('uuid', $uuid)
            ->where('depanneur_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        if ($request->notes) {
            $mission->update(['depanneur_notes' => $request->notes]);
        }

        $this->missionService->transitionStatus($mission, 'completed');

        return response()->json(['message' => 'Mission marquée comme terminée. En attente de validation client.']);
    }

    public function pending(Request $request): JsonResponse
    {
        $missions = Mission::where('status', 'searching')
            ->with(['client'])
            ->latest()
            ->take(20)
            ->get();

        return response()->json([
            'missions' => MissionResource::collection($missions),
        ]);
    }

    /**
     * Missions "searching" dans un rayon donné (défaut 3 km) autour du dépanneur.
     */
    public function nearbyMissions(Request $request): JsonResponse
    {
        $request->validate([
            'radius' => 'nullable|numeric|min:1|max:50',
        ]);

        $radius  = (float) ($request->input('radius', 3));
        $profile = $request->user()->depanneurProfile;

        if (!$profile || !$profile->current_lat || !$profile->current_lng) {
            return response()->json([
                'missions'       => [],
                'gps_available'  => false,
            ]);
        }

        $lat = (float) $profile->current_lat;
        $lng = (float) $profile->current_lng;

        $missions = Mission::selectRaw(
            "missions.*, (6371 * acos(
                cos(radians(?)) * cos(radians(client_lat)) *
                cos(radians(client_lng) - radians(?)) +
                sin(radians(?)) * sin(radians(client_lat))
            )) AS computed_distance_km",
            [$lat, $lng, $lat]
        )
        ->where('status', 'searching')
        ->whereNotNull('client_lat')
        ->whereNotNull('client_lng')
        ->having('computed_distance_km', '<=', $radius)
        ->orderBy('computed_distance_km')
        ->with(['client'])
        ->take(20)
        ->get();

        // Injecter la distance calculée dans chaque resource
        $missions->each(function ($m) {
            $m->distance_km = round($m->computed_distance_km, 2);
        });

        return response()->json([
            'missions'      => MissionResource::collection($missions),
            'gps_available' => true,
            'depanneur_lat' => $lat,
            'depanneur_lng' => $lng,
        ]);
    }
}

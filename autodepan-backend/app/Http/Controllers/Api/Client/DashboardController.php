<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Services\GPSService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly GPSService $gpsService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $lat = $request->query('lat');
        $lng = $request->query('lng');

        $nearbyDepanneurs = [];

        if ($lat && $lng) {
            $user->update(['last_lat' => $lat, 'last_lng' => $lng]);
            $nearbyDepanneurs = $this->gpsService->getNearbyDepanneurs((float) $lat, (float) $lng, 50);
        }

        $activeMission = $user->clientMissions()
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with(['depanneur.depanneurProfile', 'payment'])
            ->latest()
            ->first();

        return response()->json([
            'active_mission'      => $activeMission ?? null,
            'nearby_depanneurs'   => $nearbyDepanneurs,
            'depanneurs_count'    => count($nearbyDepanneurs),
        ]);
    }
}

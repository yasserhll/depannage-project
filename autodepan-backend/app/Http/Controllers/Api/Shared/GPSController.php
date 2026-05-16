<?php

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use App\Services\GPSService;
use App\Services\OSRMService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GPSController extends Controller
{
    public function __construct(
        private readonly GPSService  $gpsService,
        private readonly OSRMService $osrmService
    ) {}

    public function updatePosition(Request $request): JsonResponse
    {
        $request->validate([
            'lat'      => 'required|numeric|between:-90,90',
            'lng'      => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric',
            'speed'    => 'nullable|numeric',
            'heading'  => 'nullable|numeric',
            'mission_uuid' => 'nullable|string',
        ]);

        $user = $request->user();

        $this->gpsService->updateDepanneurPosition(
            $user,
            (float) $request->lat,
            (float) $request->lng,
            $request->accuracy !== null ? (float) $request->accuracy : null,
            $request->speed    !== null ? (float) $request->speed    : null,
            $request->heading  !== null ? (float) $request->heading  : null,
        );

        return response()->json(['ok' => true]);
    }

    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'lat'        => 'required|numeric|between:-90,90',
            'lng'        => 'required|numeric|between:-180,180',
            'radius_km'  => 'nullable|integer|min:1|max:100',
        ]);

        $depanneurs = $this->gpsService->getNearbyDepanneurs(
            $request->lat,
            $request->lng,
            $request->radius_km ?? 50
        );

        return response()->json(['depanneurs' => $depanneurs]);
    }

    public function route(Request $request): JsonResponse
    {
        $request->validate([
            'from_lat' => 'required|numeric',
            'from_lng' => 'required|numeric',
            'to_lat'   => 'required|numeric',
            'to_lng'   => 'required|numeric',
        ]);

        $route = $this->osrmService->getRoute(
            $request->from_lat,
            $request->from_lng,
            $request->to_lat,
            $request->to_lng
        );

        return response()->json(['route' => $route]);
    }

    public function geocode(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:3|max:200']);

        $nominatimUrl = config('gps.nominatim_url', 'https://nominatim.openstreetmap.org');

        $response = Http::withHeaders([
            'User-Agent' => 'AutoDepan/1.0 (contact@autodepan.fr)',
        ])->get("{$nominatimUrl}/search", [
            'q'              => $request->q,
            'format'         => 'json',
            'limit'          => 5,
            'addressdetails' => 1,
        ]);

        return response()->json(['results' => $response->json()]);
    }

    public function reverseGeocode(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $nominatimUrl = config('gps.nominatim_url', 'https://nominatim.openstreetmap.org');

        $response = Http::withHeaders([
            'User-Agent' => 'AutoDepan/1.0 (contact@autodepan.fr)',
        ])->get("{$nominatimUrl}/reverse", [
            'lat'    => $request->lat,
            'lon'    => $request->lng,
            'format' => 'json',
        ]);

        return response()->json(['result' => $response->json()]);
    }
}

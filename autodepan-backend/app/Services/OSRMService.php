<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OSRMService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('gps.osrm_url', 'https://router.project-osrm.org'), '/');
    }

    public function getRoute(float $fromLat, float $fromLng, float $toLat, float $toLng): ?array
    {
        $cacheKey = "osrm:{$fromLat},{$fromLng}:{$toLat},{$toLng}";

        return Cache::remember($cacheKey, 60, function () use ($fromLat, $fromLng, $toLat, $toLng) {
            try {
                $url = "{$this->baseUrl}/route/v1/driving/{$fromLng},{$fromLat};{$toLng},{$toLat}"
                     . '?overview=full&geometries=geojson&steps=false';

                $response = Http::timeout(5)->get($url);

                if (!$response->ok()) {
                    return null;
                }

                $data = $response->json();

                if (($data['code'] ?? '') !== 'Ok' || empty($data['routes'])) {
                    return null;
                }

                $route = $data['routes'][0];

                return [
                    'distance_km'      => round($route['distance'] / 1000, 2),
                    'duration_minutes' => (int) ceil($route['duration'] / 60),
                    'geometry'         => $route['geometry'],
                    'polyline_coords'  => $this->extractCoords($route['geometry']),
                ];
            } catch (\Throwable $e) {
                Log::warning('[OSRM] Routing failed', ['error' => $e->getMessage()]);
                return null;
            }
        });
    }

    public function estimateDistance(float $fromLat, float $fromLng, float $toLat, float $toLng): ?array
    {
        $route = $this->getRoute($fromLat, $fromLng, $toLat, $toLng);
        if (!$route) {
            // Fallback : distance Haversine
            $dist = $this->haversine($fromLat, $fromLng, $toLat, $toLng);
            return [
                'distance_km'      => round($dist, 2),
                'duration_minutes' => (int) ceil($dist * 2), // ~30 km/h en ville
            ];
        }
        return $route;
    }

    private function extractCoords(array $geometry): array
    {
        return array_map(
            fn($coord) => [$coord[1], $coord[0]], // [lng,lat] → [lat,lng] pour Leaflet
            $geometry['coordinates'],
        );
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * asin(sqrt($a));
    }
}

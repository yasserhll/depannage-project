<?php

namespace App\Http\Controllers\Api\Depanneur;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function toggle(Request $request): JsonResponse
    {
        $user    = $request->user()->load('depanneurProfile');
        $profile = $user->depanneurProfile;

        if (!$profile) {
            throw new ApiException('Profil dépanneur introuvable.', 'PROFILE_NOT_FOUND', 404);
        }

        if (!$profile->is_kyc_verified) {
            throw new ApiException(
                'Votre KYC doit être validé avant de pouvoir vous rendre disponible.',
                'KYC_REQUIRED',
                403
            );
        }

        $newStatus = !$profile->is_available;
        $profile->update(['is_available' => $newStatus]);

        return response()->json([
            'is_available' => $newStatus,
            'message'      => $newStatus
                ? 'Vous êtes maintenant disponible pour des missions.'
                : 'Vous êtes maintenant hors ligne.',
        ]);
    }

    public function updateLocation(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $profile = $request->user()->depanneurProfile;

        if (!$profile) {
            throw new ApiException('Profil dépanneur introuvable.', 'PROFILE_NOT_FOUND', 404);
        }

        $profile->updateLocation($request->lat, $request->lng);

        return response()->json(['message' => 'Position mise à jour.']);
    }
}

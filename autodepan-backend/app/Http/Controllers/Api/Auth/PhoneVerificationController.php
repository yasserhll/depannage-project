<?php

namespace App\Http\Controllers\Api\Auth;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PhoneVerificationController extends Controller
{
    public function sendCode(Request $request): JsonResponse
    {
        $request->validate(['phone' => 'required|string|max:20']);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put("phone_code:{$request->phone}", $code, now()->addMinutes(10));

        // TODO: intégrer un service SMS réel (Twilio, OVH, etc.)
        // Pour le MVP: log le code en dev
        if (app()->environment('local')) {
            logger("Code SMS pour {$request->phone}: {$code}");
        }

        return response()->json(['message' => 'Code envoyé.']);
    }

    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|max:20',
            'code'  => 'required|string|size:6',
        ]);

        $stored = Cache::get("phone_code:{$request->phone}");

        if (!$stored || $stored !== $request->code) {
            throw new ApiException('Code invalide ou expiré.', 'INVALID_CODE', 422);
        }

        Cache::forget("phone_code:{$request->phone}");

        $user = $request->user();

        if ($user && $user->phone === $request->phone) {
            $user->update(['phone_verified_at' => now()]);
        }

        return response()->json(['message' => 'Téléphone vérifié avec succès.']);
    }
}

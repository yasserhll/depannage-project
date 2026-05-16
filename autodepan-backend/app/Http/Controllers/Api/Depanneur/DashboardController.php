<?php

namespace App\Http\Controllers\Api\Depanneur;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user    = $request->user()->load('depanneurProfile');
        $profile = $user->depanneurProfile;

        $today = now()->startOfDay();

        $stats = [
            'missions_today'     => $user->depanneurMissions()->whereDate('created_at', today())->count(),
            'missions_completed' => $user->depanneurMissions()->where('status', 'completed')->count(),
            'missions_active'    => $user->depanneurMissions()->whereNotIn('status', ['completed', 'cancelled'])->count(),
            'rating_avg'         => (float) ($profile?->rating_avg ?? 0),
            'rating_count'       => $profile?->rating_count ?? 0,
            'total_missions'     => $profile?->total_missions ?? 0,
        ];

        $wallet  = $user->wallet;
        $pending = $user->depanneurMissions()
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with(['client', 'payment'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats'            => $stats,
            'wallet_balance'   => $wallet ? (float) $wallet->balance : 0.00,
            'pending_missions' => $pending,
            'is_available'     => (bool) $profile?->is_available,
            'kyc_status'       => $profile?->kyc_status ?? 'pending',
            'is_kyc_verified'  => (bool) $profile?->is_kyc_verified,
        ]);
    }
}

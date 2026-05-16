<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $today = today();

        $stats = [
            'missions'  => [
                'today'     => Mission::whereDate('created_at', $today)->count(),
                'active'    => Mission::whereNotIn('status', ['completed', 'cancelled'])->count(),
                'completed' => Mission::where('status', 'completed')->count(),
                'disputed'  => Mission::where('status', 'disputed')->count(),
                'total'     => Mission::count(),
            ],
            'users'     => [
                'total'       => User::count(),
                'clients'     => User::where('role', 'client')->count(),
                'depanneurs'  => User::where('role', 'depanneur')->count(),
                'new_today'   => User::whereDate('created_at', $today)->count(),
            ],
            'kyc'       => [
                'pending'  => \App\Models\DepanneurProfile::where('kyc_status', 'in_review')->count(),
                'approved' => \App\Models\DepanneurProfile::where('kyc_status', 'approved')->count(),
                'rejected' => \App\Models\DepanneurProfile::where('kyc_status', 'rejected')->count(),
            ],
            'revenue'   => [
                'today'     => Payment::whereDate('created_at', $today)->where('status', 'released')->sum('platform_fee'),
                'this_month' => Payment::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->where('status', 'released')
                    ->sum('platform_fee'),
                'total'     => Payment::where('status', 'released')->sum('platform_fee'),
            ],
            'disputes'  => [
                'open'     => \App\Models\Dispute::where('status', 'open')->count(),
                'pending'  => \App\Models\Dispute::where('status', 'under_review')->count(),
            ],
        ];

        $recentMissions = Mission::with(['client', 'depanneur'])
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'stats'           => $stats,
            'recent_missions' => $recentMissions,
        ]);
    }

    public function activeDepanneurs(): JsonResponse
    {
        $depanneurs = User::where('role', 'depanneur')
            ->whereHas('depanneurProfile', fn($q) => $q->where('is_available', true))
            ->with('depanneurProfile')
            ->get()
            ->map(fn($u) => [
                'id'          => $u->id,
                'name'        => $u->name,
                'lat'         => $u->depanneurProfile->current_lat,
                'lng'         => $u->depanneurProfile->current_lng,
                'rating'      => $u->depanneurProfile->rating_avg,
                'updated_at'  => $u->depanneurProfile->location_updated_at,
            ]);

        return response()->json(['depanneurs' => $depanneurs]);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureKYCVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user?->depanneurProfile?->is_kyc_verified) {
            return response()->json([
                'message'    => 'Votre compte nécessite une validation KYC pour accéder à cette fonctionnalité.',
                'kyc_status' => $user?->depanneurProfile?->kyc_status ?? 'pending',
            ], 403);
        }

        return $next($request);
    }
}

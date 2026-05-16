<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitGPS
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = 'gps:' . ($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, maxAttempts: 30)) {
            return response()->json(['message' => 'Trop de mises à jour GPS. Réessayez dans quelques secondes.'], 429);
        }

        RateLimiter::hit($key, decaySeconds: 60);

        return $next($request);
    }
}

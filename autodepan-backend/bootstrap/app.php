<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\EnsureRole;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api:      __DIR__ . '/../routes/api.php',
        channels: __DIR__ . '/../routes/channels.php',
        commands: __DIR__ . '/../routes/console.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            SecurityHeaders::class,
        ]);

        $middleware->alias([
            'role'         => EnsureRole::class,
            'kyc'          => \App\Http\Middleware\EnsureKYCVerified::class,
            'throttle.gps' => \App\Http\Middleware\RateLimitGPS::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\App\Exceptions\ApiException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors'  => $e->getErrors(),
            ], $e->getCode() ?: 422);
        });
    })
    ->create();

<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PhoneVerificationController;
use App\Http\Controllers\Api\Client\DashboardController as ClientDashboardController;
use App\Http\Controllers\Api\Client\MissionController as ClientMissionController;
use App\Http\Controllers\Api\Depanneur\AvailabilityController;
use App\Http\Controllers\Api\Depanneur\DashboardController as DepanneurDashboardController;
use App\Http\Controllers\Api\Depanneur\DocumentController;
use App\Http\Controllers\Api\Depanneur\MissionController as DepanneurMissionController;
use App\Http\Controllers\Api\Depanneur\WalletController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\DisputeController;
use App\Http\Controllers\Api\Admin\LogController;
use App\Http\Controllers\Api\Admin\KYCController;
use App\Http\Controllers\Api\Admin\MissionController as AdminMissionController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Payment\StripeController;
use App\Http\Controllers\Api\Payment\WebhookController;
use App\Http\Controllers\Api\Shared\ChatController;
use App\Http\Controllers\Api\Shared\GPSController;
use App\Http\Controllers\Api\Shared\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::post('phone/send', [PhoneVerificationController::class, 'sendCode'])->middleware('throttle:5,1');
});

// Stripe webhook — sans auth Sanctum, signature vérifiée manuellement
Route::post('stripe/webhook', [WebhookController::class, 'handle'])
    ->name('stripe.webhook')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

/*
|--------------------------------------------------------------------------
| Routes authentifiées (tous rôles)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout'])->withoutMiddleware('auth:sanctum');
        Route::patch('profile', [AuthController::class, 'updateProfile']);
        Route::post('fcm-token', [AuthController::class, 'updateFcmToken']);
        Route::post('phone/verify', [PhoneVerificationController::class, 'verifyCode']);
    });

    // Notifications (partagé)
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::patch('{id}/read', [NotificationController::class, 'markRead']);
        Route::post('read-all', [NotificationController::class, 'markAllRead']);
        Route::delete('{id}', [NotificationController::class, 'destroy']);
    });

    // Chat (partagé)
    Route::prefix('missions/{uuid}/chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'messages']);
        Route::post('/', [ChatController::class, 'send']);
    });

    // GPS partagé (pour le client — géocodage, dépanneurs proches)
    Route::prefix('gps')->name('gps.')->group(function () {
        Route::get('nearby', [GPSController::class, 'nearby']);
        Route::get('route', [GPSController::class, 'route']);
        Route::get('geocode', [GPSController::class, 'geocode']);
        Route::get('reverse', [GPSController::class, 'reverseGeocode']);
    });

    /*
    |--------------------------------------------------------------------------
    | Client
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:client')->prefix('client')->name('client.')->group(function () {

        Route::get('dashboard', [ClientDashboardController::class, 'index']);

        Route::prefix('missions')->name('missions.')->group(function () {
            Route::get('/', [ClientMissionController::class, 'index']);
            Route::post('/', [ClientMissionController::class, 'store']);
            Route::get('{uuid}', [ClientMissionController::class, 'show']);
            Route::post('{uuid}/cancel', [ClientMissionController::class, 'cancel']);
            Route::post('{uuid}/validate', [ClientMissionController::class, 'validate']);
            Route::post('{uuid}/dispute', [ClientMissionController::class, 'dispute']);
            Route::post('{uuid}/photos', [ClientMissionController::class, 'uploadPhotos']);
            Route::get('{uuid}/tracking', [ClientMissionController::class, 'tracking']);
        });

        // Paiement Stripe côté client
        Route::prefix('payment')->name('payment.')->group(function () {
            Route::post('create-intent', [StripeController::class, 'createIntent']);
            Route::post('confirm', [StripeController::class, 'confirm']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Dépanneur
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:depanneur')->prefix('depanneur')->name('depanneur.')->group(function () {

        Route::get('dashboard', [DepanneurDashboardController::class, 'index']);

        // Disponibilité et GPS
        Route::post('availability/toggle', [AvailabilityController::class, 'toggle']);
        Route::post('location', [AvailabilityController::class, 'updateLocation'])
            ->middleware('throttle.gps');

        // GPS temps réel (throttle spécial)
        Route::post('gps/update', [GPSController::class, 'updatePosition'])
            ->middleware('throttle.gps');

        // Missions
        Route::prefix('missions')->name('missions.')->group(function () {
            Route::get('/', [DepanneurMissionController::class, 'index']);
            Route::get('pending', [DepanneurMissionController::class, 'pending']);
            Route::get('nearby', [DepanneurMissionController::class, 'nearbyMissions']);
            Route::get('{uuid}', [DepanneurMissionController::class, 'show']);
            Route::post('{uuid}/accept', [DepanneurMissionController::class, 'accept']);
            Route::post('{uuid}/arrive', [DepanneurMissionController::class, 'arrive']);
            Route::post('{uuid}/start', [DepanneurMissionController::class, 'start']);
            Route::post('{uuid}/complete', [DepanneurMissionController::class, 'complete']);
        });

        // Documents KYC
        Route::prefix('documents')->name('documents.')->group(function () {
            Route::get('/', [DocumentController::class, 'index']);
            Route::post('upload', [DocumentController::class, 'upload']);
            Route::delete('{id}', [DocumentController::class, 'destroy']);
        });

        // Wallet
        Route::prefix('wallet')->name('wallet.')->group(function () {
            Route::get('/', [WalletController::class, 'index']);
            Route::get('transactions', [WalletController::class, 'transactions']);
            Route::post('withdraw', [WalletController::class, 'requestWithdrawal']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {

        Route::get('dashboard', [AdminDashboardController::class, 'index']);
        Route::get('dashboard/active-depanneurs', [AdminDashboardController::class, 'activeDepanneurs']);

        // Utilisateurs
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('{id}', [UserController::class, 'show']);
            Route::patch('{id}/status', [UserController::class, 'updateStatus']);
            Route::delete('{id}', [UserController::class, 'destroy']);
        });

        // KYC
        Route::prefix('kyc')->name('kyc.')->group(function () {
            Route::get('pending', [KYCController::class, 'pending']);
            Route::post('{userId}/approve', [KYCController::class, 'approve']);
            Route::post('{userId}/reject', [KYCController::class, 'reject']);
            Route::post('documents/{id}/approve', [KYCController::class, 'approveDocument']);
            Route::post('documents/{id}/reject', [KYCController::class, 'rejectDocument']);
        });

        // Missions
        Route::prefix('missions')->name('missions.')->group(function () {
            Route::get('/', [AdminMissionController::class, 'index']);
            Route::get('{uuid}', [AdminMissionController::class, 'show']);
            Route::post('{uuid}/note', [AdminMissionController::class, 'addNote']);
        });

        // Paiements
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/', [AdminPaymentController::class, 'index']);
            Route::post('{id}/release', [AdminPaymentController::class, 'release']);
            Route::post('{id}/refund', [AdminPaymentController::class, 'refund']);
        });

        // Litiges
        Route::prefix('disputes')->name('disputes.')->group(function () {
            Route::get('/', [DisputeController::class, 'index']);
            Route::get('{id}', [DisputeController::class, 'show']);
            Route::post('{id}/resolve', [DisputeController::class, 'resolve']);
            Route::patch('{id}/status', [DisputeController::class, 'updateStatus']);
        });

        // Logs d'activité
        Route::get('logs', [LogController::class, 'index']);
    });
});

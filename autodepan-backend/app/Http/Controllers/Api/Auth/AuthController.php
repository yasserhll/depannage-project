<?php

namespace App\Http\Controllers\Api\Auth;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\DepanneurProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'client',
        ]);

        if ($user->role === 'depanneur') {
            DepanneurProfile::create(['user_id' => $user->id]);
        }

        $user->getOrCreateWallet();

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'token'   => $token,
            'user'    => new UserResource($user->load('depanneurProfile')),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $field = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw new ApiException('Identifiants incorrects.', 'INVALID_CREDENTIALS', 401);
        }

        if ($user->status === 'banned') {
            throw new ApiException('Votre compte a été banni.', 'ACCOUNT_BANNED', 403);
        }

        if ($user->status === 'suspended') {
            throw new ApiException('Votre compte est suspendu.', 'ACCOUNT_SUSPENDED', 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('api')->plainTextToken;

        $user->update(['last_seen_at' => now()]);

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user->load('depanneurProfile')),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('depanneurProfile')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            throw new ApiException('Impossible d\'envoyer le lien de réinitialisation.', 'RESET_FAILED', 400);
        }

        return response()->json(['message' => 'Lien de réinitialisation envoyé.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new ApiException('Lien invalide ou expiré.', 'RESET_TOKEN_INVALID', 400);
        }

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'sometimes|string|max:100',
            'locale' => 'sometimes|in:fr,en,ar',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'user' => new UserResource($request->user()->fresh()->load('depanneurProfile')),
        ]);
    }

    public function updateFcmToken(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string|max:500',
            'platform' => 'required|in:android,ios,web',
        ]);

        $user = $request->user();

        $user->pushTokens()->updateOrCreate(
            ['platform' => $request->platform],
            ['token' => $request->token]
        );

        return response()->json(['message' => 'Token FCM mis à jour.']);
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::withTrashed()->with('depanneurProfile');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $users = $query->latest()->paginate(30);

        return response()->json([
            'users'      => UserResource::collection($users->items()),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::withTrashed()
            ->with(['depanneurProfile', 'documents'])
            ->findOrFail($id);

        return response()->json(['user' => new UserResource($user)]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,suspended,banned',
            'reason' => 'nullable|string|max:500',
        ]);

        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            throw new ApiException('Impossible de modifier le statut d\'un administrateur.', 'FORBIDDEN', 403);
        }

        $oldStatus = $user->status;
        $user->update(['status' => $request->status]);

        ActivityLog::record(
            'user.status_changed',
            $request->user()->id,
            User::class,
            $user->id,
            ['status' => $oldStatus],
            ['status' => $request->status, 'reason' => $request->reason]
        );

        return response()->json([
            'message' => "Statut mis à jour : {$request->status}.",
            'user'    => new UserResource($user),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            throw new ApiException('Impossible de supprimer un administrateur.', 'FORBIDDEN', 403);
        }

        $user->delete();

        ActivityLog::record('user.deleted', $request->user()->id, User::class, $user->id);

        return response()->json(['message' => 'Utilisateur supprimé (soft delete).']);
    }
}

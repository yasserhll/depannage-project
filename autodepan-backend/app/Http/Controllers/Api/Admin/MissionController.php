<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MissionResource;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Mission::with(['client', 'depanneur', 'payment']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where('uuid', 'like', "%{$request->search}%")
                ->orWhereHas('client', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $missions = $query->latest()->paginate(30);

        return response()->json([
            'missions'   => MissionResource::collection($missions->items()),
            'pagination' => [
                'current_page' => $missions->currentPage(),
                'last_page'    => $missions->lastPage(),
                'total'        => $missions->total(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $mission = Mission::where('uuid', $uuid)
            ->with(['client', 'depanneur', 'photos', 'payment', 'dispute', 'chatMessages.sender'])
            ->firstOrFail();

        return response()->json(['mission' => new MissionResource($mission)]);
    }

    public function addNote(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['note' => 'required|string|max:1000']);

        $mission = Mission::where('uuid', $uuid)->firstOrFail();
        $mission->update(['admin_notes' => $request->note]);

        return response()->json(['message' => 'Note ajoutée.']);
    }
}

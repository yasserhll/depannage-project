<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query();

        if ($request->search) {
            $query->where('action', 'like', "%{$request->search}%")
                ->orWhere('user_id', $request->search);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        $logs = $query->latest('created_at')->paginate(50);

        return response()->json([
            'logs'       => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\Shared;

use App\Events\NewChatMessage;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\ChatMessageResource;
use App\Models\ChatMessage;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function messages(Request $request, string $uuid): JsonResponse
    {
        $mission = $this->getMissionForUser($request, $uuid);

        $messages = $mission->chatMessages()
            ->with('sender')
            ->oldest('created_at')
            ->paginate(50);

        // Marquer comme lus
        $mission->chatMessages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'messages'   => ChatMessageResource::collection($messages->items()),
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
            ],
        ]);
    }

    public function send(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'type'    => 'required|in:text,image,location',
            'content' => 'required_if:type,text|string|max:1000',
            'file'    => 'required_if:type,image|file|image|mimes:jpg,jpeg,png|max:5120',
            'lat'     => 'required_if:type,location|numeric',
            'lng'     => 'required_if:type,location|numeric',
        ]);

        $mission = $this->getMissionForUser($request, $uuid);

        if (in_array($mission->status, ['completed', 'cancelled'])) {
            throw new ApiException('La mission est terminée, le chat est fermé.', 'CHAT_CLOSED', 422);
        }

        $data = [
            'mission_id' => $mission->id,
            'sender_id'  => $request->user()->id,
            'type'       => $request->type,
        ];

        if ($request->type === 'text') {
            $data['content'] = $request->content;
        } elseif ($request->type === 'image') {
            $path = $request->file('file')->store("chat/{$mission->uuid}", 'public');
            $data['file_path'] = $path;
        } elseif ($request->type === 'location') {
            $data['lat'] = $request->lat;
            $data['lng'] = $request->lng;
        }

        $message = ChatMessage::create($data);
        $message->load('sender');

        broadcast(new NewChatMessage($mission, $message))->toOthers();

        return response()->json([
            'message' => new ChatMessageResource($message),
        ], 201);
    }

    private function getMissionForUser(Request $request, string $uuid): Mission
    {
        $user    = $request->user();
        $mission = Mission::where('uuid', $uuid)->firstOrFail();

        $isParticipant = $mission->client_id === $user->id
            || $mission->depanneur_id === $user->id
            || $user->role === 'admin';

        if (!$isParticipant) {
            throw new ApiException('Accès refusé à ce chat.', 'FORBIDDEN', 403);
        }

        return $mission;
    }
}

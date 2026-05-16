<?php

namespace App\Events;

use App\Models\ChatMessage;
use App\Models\Mission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Mission     $mission,
        public readonly ChatMessage $message,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("mission.{$this->mission->uuid}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.message';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id'         => $this->message->id,
                'mission_id' => $this->message->mission_id,
                'sender_id'  => $this->message->sender_id,
                'type'       => $this->message->type,
                'content'    => $this->message->content,
                'read_at'    => $this->message->read_at,
                'created_at' => $this->message->created_at->toISOString(),
                'sender'     => [
                    'id'     => $this->message->sender->id,
                    'name'   => $this->message->sender->name,
                    'avatar' => $this->message->sender->avatar,
                ],
            ],
        ];
    }
}

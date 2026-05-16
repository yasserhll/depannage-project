<?php

namespace App\Events;

use App\Models\Mission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MissionStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Mission $mission,
        public readonly string  $newStatus,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("mission.{$this->mission->uuid}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'mission.status_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'mission_uuid' => $this->mission->uuid,
            'status'       => $this->newStatus,
            'timestamp'    => now()->toISOString(),
        ];
    }
}

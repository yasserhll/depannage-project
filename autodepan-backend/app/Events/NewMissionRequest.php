<?php

namespace App\Events;

use App\Models\Mission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMissionRequest implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Mission $mission,
        public readonly array   $depanneurData,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("depanneur.{$this->depanneurData['user_id']}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'mission.new_request';
    }

    public function broadcastWith(): array
    {
        return [
            'id'             => $this->mission->id,
            'uuid'           => $this->mission->uuid,
            'breakdown_type' => $this->mission->breakdown_type,
            'client_lat'     => $this->mission->client_lat,
            'client_lng'     => $this->mission->client_lng,
            'client_address' => $this->mission->client_address,
            'distance_km'    => $this->depanneurData['distance_km'],
            'eta_minutes'    => $this->depanneurData['eta_minutes'],
            'estimated_price' => $this->mission->estimated_price,
            'status'         => $this->mission->status,
        ];
    }
}

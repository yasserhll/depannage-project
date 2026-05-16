<?php

namespace App\Events;

use App\Models\Mission;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GPSPositionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Mission $mission,
        public readonly float   $lat,
        public readonly float   $lng,
        public readonly ?int    $etaMinutes,
        public readonly ?float  $distanceKm,
        public readonly ?array  $route,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("mission.{$this->mission->uuid}"),
            new Channel('admin.dashboard'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'gps.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'mission_uuid'    => $this->mission->uuid,
            'depanneur_lat'   => $this->lat,
            'depanneur_lng'   => $this->lng,
            'eta_minutes'     => $this->etaMinutes,
            'distance_km'     => $this->distanceKm,
            'route'           => $this->route,
            'depanneur_id'    => $this->mission->depanneur_id,
            'depanneur_name'  => $this->mission->depanneur?->name,
        ];
    }
}

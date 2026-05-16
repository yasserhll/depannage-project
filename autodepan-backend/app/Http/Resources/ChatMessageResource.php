<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'type'       => $this->type,
            'content'    => $this->content,
            'file_url'   => $this->file_path ? asset('storage/' . $this->file_path) : null,
            'lat'        => $this->lat ? (float) $this->lat : null,
            'lng'        => $this->lng ? (float) $this->lng : null,
            'read_at'    => $this->read_at,
            'created_at' => $this->created_at,
            'sender'     => $this->when(
                $this->relationLoaded('sender'),
                fn() => [
                    'id'     => $this->sender->id,
                    'name'   => $this->sender->name,
                    'avatar' => $this->sender->avatar,
                    'role'   => $this->sender->role,
                ]
            ),
        ];
    }
}

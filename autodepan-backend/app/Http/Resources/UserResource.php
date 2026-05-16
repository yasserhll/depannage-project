<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'email'               => $this->email,
            'phone'               => $this->phone,
            'role'                => $this->role,
            'status'              => $this->status,
            'avatar'              => $this->avatar,
            'locale'              => $this->locale,
            'phone_verified_at'   => $this->phone_verified_at,
            'email_verified_at'   => $this->email_verified_at,
            'last_lat'            => $this->last_lat,
            'last_lng'            => $this->last_lng,
            'last_seen_at'        => $this->last_seen_at,
            'created_at'          => $this->created_at,
            'depanneur_profile'   => $this->when(
                $this->role === 'depanneur' && $this->relationLoaded('depanneurProfile'),
                fn() => new DepanneurProfileResource($this->depanneurProfile)
            ),
        ];
    }
}

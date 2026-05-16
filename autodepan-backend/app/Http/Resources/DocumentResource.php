<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'type'             => $this->type,
            'url'              => asset('storage/' . $this->file_path),
            'status'           => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'reviewed_at'      => $this->reviewed_at,
            'expires_at'       => $this->expires_at,
            'created_at'       => $this->created_at,
        ];
    }
}

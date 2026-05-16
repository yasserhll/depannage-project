<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MissionPhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'url'         => asset('storage/' . $this->file_path),
            'type'        => $this->type,
            'uploaded_by' => $this->uploaded_by,
            'created_at'  => $this->created_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepanneurProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'business_name'       => $this->business_name,
            'description'         => $this->description,
            'specializations'     => $this->specializations ?? [],
            'service_radius_km'   => $this->service_radius_km,
            'is_available'        => $this->is_available,
            'is_kyc_verified'     => $this->is_kyc_verified,
            'kyc_status'          => $this->kyc_status,
            'vehicle_type'        => $this->vehicle_type,
            'vehicle_plate'       => $this->vehicle_plate,
            'vehicle_model'       => $this->vehicle_model,
            'rating_avg'          => (float) $this->rating_avg,
            'rating_count'        => $this->rating_count,
            'total_missions'      => $this->total_missions,
            'current_lat'         => $this->current_lat ? (float) $this->current_lat : null,
            'current_lng'         => $this->current_lng ? (float) $this->current_lng : null,
            'location_updated_at' => $this->location_updated_at,
        ];
    }
}

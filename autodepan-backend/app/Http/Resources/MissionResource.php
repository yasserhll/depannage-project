<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'uuid'                   => $this->uuid,
            'status'                 => $this->status,
            'client_lat'             => (float) $this->client_lat,
            'client_lng'             => (float) $this->client_lng,
            'client_address'         => $this->client_address,
            'breakdown_type'         => $this->breakdown_type,
            'breakdown_details'      => $this->breakdown_details,
            'vehicle_brand'          => $this->vehicle_brand,
            'vehicle_model'          => $this->vehicle_model,
            'vehicle_year'           => $this->vehicle_year,
            'vehicle_plate'          => $this->vehicle_plate,
            'estimated_price'        => $this->estimated_price ? (float) $this->estimated_price : null,
            'final_price'            => $this->final_price ? (float) $this->final_price : null,
            'platform_fee'           => $this->platform_fee ? (float) $this->platform_fee : null,
            'depanneur_amount'       => $this->depanneur_amount ? (float) $this->depanneur_amount : null,
            'currency'               => $this->currency,
            'distance_km'            => $this->distance_km ? (float) $this->distance_km : null,
            'estimated_duration_min' => $this->estimated_duration_min,
            'client_notes'           => $this->client_notes,
            'depanneur_notes'        => $this->depanneur_notes,
            'accepted_at'            => $this->accepted_at,
            'arrived_at'             => $this->arrived_at,
            'started_at'             => $this->started_at,
            'completed_at'           => $this->completed_at,
            'cancelled_at'           => $this->cancelled_at,
            'cancellation_reason'    => $this->cancellation_reason,
            'cancelled_by'           => $this->cancelled_by,
            'auto_validate_at'       => $this->auto_validate_at,
            'created_at'             => $this->created_at,
            'client'                 => $this->when(
                $this->relationLoaded('client'),
                fn() => new UserResource($this->client)
            ),
            'depanneur'              => $this->when(
                $this->relationLoaded('depanneur'),
                fn() => new UserResource($this->depanneur)
            ),
            'photos'                 => $this->when(
                $this->relationLoaded('photos'),
                fn() => MissionPhotoResource::collection($this->photos)
            ),
            'payment'                => $this->when(
                $this->relationLoaded('payment'),
                fn() => new PaymentResource($this->payment)
            ),
        ];
    }
}

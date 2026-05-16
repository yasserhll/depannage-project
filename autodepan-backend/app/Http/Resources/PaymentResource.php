<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                       => $this->id,
            'status'                   => $this->status,
            'amount'                   => (float) $this->amount,
            'platform_fee'             => (float) $this->platform_fee,
            'depanneur_amount'         => (float) $this->depanneur_amount,
            'currency'                 => $this->currency,
            'stripe_payment_intent_id' => $this->stripe_payment_intent_id,
            'authorized_at'            => $this->authorized_at,
            'captured_at'              => $this->captured_at,
            'released_at'              => $this->released_at,
            'refunded_at'              => $this->refunded_at,
            'created_at'               => $this->created_at,
        ];
    }
}

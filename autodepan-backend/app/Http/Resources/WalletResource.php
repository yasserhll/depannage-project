<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'balance'             => (float) $this->balance,
            'pending_balance'     => (float) $this->pending_balance,
            'total_earned'        => (float) $this->total_earned,
            'total_withdrawn'     => (float) $this->total_withdrawn,
            'currency'            => $this->currency,
            'updated_at'          => $this->updated_at,
        ];
    }
}

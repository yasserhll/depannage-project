<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    protected $fillable = [
        'mission_id', 'client_id',
        'stripe_payment_intent_id', 'stripe_charge_id',
        'amount', 'currency', 'status',
        'authorized_at', 'captured_at', 'released_at', 'refunded_at',
        'refund_reason', 'stripe_metadata',
        'platform_fee', 'depanneur_amount',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'platform_fee'     => 'decimal:2',
        'depanneur_amount' => 'decimal:2',
        'stripe_metadata'  => 'array',
        'authorized_at'    => 'datetime',
        'captured_at'      => 'datetime',
        'released_at'      => 'datetime',
        'refunded_at'      => 'datetime',
    ];

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }
}

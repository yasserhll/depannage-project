<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commission extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'mission_id', 'payment_id',
        'gross_amount', 'rate', 'commission_amount', 'net_amount',
    ];

    protected $casts = [
        'gross_amount'      => 'decimal:2',
        'rate'              => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'net_amount'        => 'decimal:2',
        'created_at'        => 'datetime',
    ];

    public function mission(): BelongsTo  { return $this->belongsTo(Mission::class); }
    public function payment(): BelongsTo  { return $this->belongsTo(Payment::class); }
}

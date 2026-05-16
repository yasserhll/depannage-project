<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    protected $fillable = [
        'mission_id', 'opened_by', 'opened_by_type',
        'reason', 'description', 'evidence_files',
        'status', 'resolved_by', 'resolution_note',
        'resolved_at', 'refund_amount',
    ];

    protected $casts = [
        'evidence_files' => 'array',
        'resolved_at'    => 'datetime',
        'refund_amount'  => 'decimal:2',
    ];

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}

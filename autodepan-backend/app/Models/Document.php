<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    protected $fillable = [
        'user_id', 'type', 'file_path', 'file_hash',
        'status', 'rejection_reason', 'reviewed_at', 'reviewed_by', 'expires_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'expires_at'  => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

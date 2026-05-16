<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'mission_id', 'sender_id', 'type',
        'content', 'file_path', 'lat', 'lng', 'read_at',
    ];

    protected $casts = [
        'lat'        => 'decimal:8',
        'lng'        => 'decimal:8',
        'read_at'    => 'datetime',
        'created_at' => 'datetime',
    ];

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}

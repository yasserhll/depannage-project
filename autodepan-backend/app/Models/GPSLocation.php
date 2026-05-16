<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GPSLocation extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'mission_id', 'user_id', 'lat', 'lng',
        'accuracy', 'speed', 'heading',
    ];

    protected $casts = [
        'lat'        => 'decimal:8',
        'lng'        => 'decimal:8',
        'accuracy'   => 'float',
        'speed'      => 'float',
        'heading'    => 'float',
        'created_at' => 'datetime',
    ];

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

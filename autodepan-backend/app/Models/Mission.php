<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Mission extends Model
{
    protected $fillable = [
        'uuid', 'client_id', 'depanneur_id', 'status',
        'client_lat', 'client_lng', 'client_address',
        'breakdown_type', 'breakdown_details',
        'vehicle_brand', 'vehicle_model', 'vehicle_year', 'vehicle_plate',
        'estimated_price', 'final_price', 'platform_fee', 'depanneur_amount', 'currency',
        'accepted_at', 'arrived_at', 'started_at', 'completed_at',
        'cancelled_at', 'cancellation_reason', 'cancelled_by', 'auto_validate_at',
        'distance_km', 'estimated_duration_min',
        'client_notes', 'depanneur_notes', 'admin_notes',
    ];

    protected $casts = [
        'client_lat'       => 'decimal:8',
        'client_lng'       => 'decimal:8',
        'estimated_price'  => 'decimal:2',
        'final_price'      => 'decimal:2',
        'platform_fee'     => 'decimal:2',
        'depanneur_amount' => 'decimal:2',
        'distance_km'      => 'decimal:3',
        'accepted_at'      => 'datetime',
        'arrived_at'       => 'datetime',
        'started_at'       => 'datetime',
        'completed_at'     => 'datetime',
        'cancelled_at'     => 'datetime',
        'auto_validate_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Mission $mission) {
            $mission->uuid ??= Str::uuid()->toString();
        });
    }

    // ── Relations ──────────────────────────────────────────────────────────────

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function depanneur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'depanneur_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MissionPhoto::class);
    }

    public function gpsLocations(): HasMany
    {
        return $this->hasMany(GPSLocation::class)->orderBy('created_at');
    }

    public function latestGPS(): HasOne
    {
        return $this->hasOne(GPSLocation::class)->latestOfMany('created_at');
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class)->orderBy('created_at');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function dispute(): HasOne
    {
        return $this->hasOne(Dispute::class);
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return in_array($this->status, ['searching', 'accepted', 'en_route', 'arrived', 'in_progress']);
    }

    public function canBeCancelledByClient(): bool
    {
        return in_array($this->status, ['searching', 'accepted']);
    }

    public function transitionTo(string $status): void
    {
        $timestamps = [
            'accepted'    => 'accepted_at',
            'arrived'     => 'arrived_at',
            'in_progress' => 'started_at',
            'completed'   => 'completed_at',
        ];

        $update = ['status' => $status];
        if (isset($timestamps[$status])) {
            $update[$timestamps[$status]] = now();
        }

        $this->update($update);
    }
}

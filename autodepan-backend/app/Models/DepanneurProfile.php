<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepanneurProfile extends Model
{
    protected $fillable = [
        'user_id', 'business_name', 'description', 'specializations',
        'service_radius_km', 'is_available', 'is_kyc_verified', 'kyc_status',
        'kyc_reviewed_at', 'kyc_reviewed_by', 'kyc_notes',
        'vehicle_type', 'vehicle_plate', 'vehicle_model',
        'rating_avg', 'rating_count', 'total_missions',
        'current_lat', 'current_lng', 'location_updated_at',
        'bank_account_iban', 'stripe_account_id',
    ];

    protected $casts = [
        'specializations'     => 'array',
        'is_available'        => 'boolean',
        'is_kyc_verified'     => 'boolean',
        'rating_avg'          => 'decimal:2',
        'current_lat'         => 'decimal:8',
        'current_lng'         => 'decimal:8',
        'kyc_reviewed_at'     => 'datetime',
        'location_updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function updateLocation(float $lat, float $lng): void
    {
        $this->update([
            'current_lat'         => $lat,
            'current_lng'         => $lng,
            'location_updated_at' => now(),
        ]);
    }

    public function recalculateRating(): void
    {
        $reviews = Review::where('reviewee_id', $this->user_id)->get();
        $this->update([
            'rating_avg'   => $reviews->avg('rating') ?? 0,
            'rating_count' => $reviews->count(),
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    protected $fillable = [
        'user_id', 'balance', 'pending_balance',
        'total_earned', 'total_withdrawn', 'currency',
    ];

    protected $casts = [
        'balance'          => 'decimal:2',
        'pending_balance'  => 'decimal:2',
        'total_earned'     => 'decimal:2',
        'total_withdrawn'  => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->orderByDesc('created_at');
    }

    public function credit(float $amount, string $description, ?int $missionId = null, ?string $reference = null): WalletTransaction
    {
        $this->increment('balance', $amount);
        $this->increment('total_earned', $amount);

        return $this->transactions()->create([
            'mission_id'    => $missionId,
            'type'          => 'credit',
            'amount'        => $amount,
            'balance_after' => $this->fresh()->balance,
            'description'   => $description,
            'reference'     => $reference,
        ]);
    }
}

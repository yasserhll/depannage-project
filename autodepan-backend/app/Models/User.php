<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles;

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'avatar',
        'role', 'status', 'google_id', 'fcm_token',
        'last_lat', 'last_lng', 'last_seen_at', 'locale',
        'phone_verified_at', 'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at'  => 'datetime',
        'phone_verified_at'  => 'datetime',
        'last_seen_at'       => 'datetime',
        'last_lat'           => 'decimal:8',
        'last_lng'           => 'decimal:8',
    ];

    // ── Relations ──────────────────────────────────────────────────────────────

    public function depanneurProfile(): HasOne
    {
        return $this->hasOne(DepanneurProfile::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function clientMissions(): HasMany
    {
        return $this->hasMany(Mission::class, 'client_id');
    }

    public function depanneurMissions(): HasMany
    {
        return $this->hasMany(Mission::class, 'depanneur_id');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function pushTokens(): HasMany
    {
        return $this->hasMany(PushToken::class);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    public function isClient(): bool    { return $this->role === 'client'; }
    public function isDepanneur(): bool { return $this->role === 'depanneur'; }
    public function isAdmin(): bool     { return $this->role === 'admin'; }
    public function isActive(): bool    { return $this->status === 'active'; }

    public function getOrCreateWallet(): Wallet
    {
        return $this->wallet ?? Wallet::create(['user_id' => $this->id]);
    }
}

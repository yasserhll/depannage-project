<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionPhoto extends Model
{
    public $timestamps = false;

    protected $fillable = ['mission_id', 'uploaded_by', 'file_path', 'type'];

    protected $casts = ['created_at' => 'datetime'];

    public function mission(): BelongsTo  { return $this->belongsTo(Mission::class); }
    public function uploader(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }
}

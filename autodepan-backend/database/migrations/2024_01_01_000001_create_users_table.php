<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 191)->unique()->nullable();
            $table->string('phone', 20)->unique()->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('avatar', 500)->nullable();
            $table->enum('role', ['client', 'depanneur', 'admin'])->default('client');
            $table->enum('status', ['active', 'suspended', 'pending', 'banned'])->default('active');
            $table->string('google_id', 191)->nullable()->index();
            $table->string('fcm_token', 500)->nullable();
            $table->decimal('last_lat', 10, 8)->nullable();
            $table->decimal('last_lng', 11, 8)->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->string('locale', 10)->default('fr');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->index('role');
            $table->index('status');
            $table->index(['last_lat', 'last_lng']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

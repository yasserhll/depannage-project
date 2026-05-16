<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mission_id')->constrained();
            $table->foreignId('client_id')->constrained('users');
            $table->string('stripe_payment_intent_id', 255)->unique();
            $table->string('stripe_charge_id', 255)->nullable();
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('EUR');
            $table->enum('status', [
                'pending',
                'authorized',
                'captured',
                'released',
                'refunded',
                'partially_refunded',
                'failed',
                'disputed',
            ])->default('pending');
            $table->decimal('platform_fee', 10, 2)->nullable();
            $table->decimal('depanneur_amount', 10, 2)->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->text('refund_reason')->nullable();
            $table->json('stripe_metadata')->nullable();
            $table->timestamps();

            $table->index('mission_id');
            $table->index('stripe_payment_intent_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

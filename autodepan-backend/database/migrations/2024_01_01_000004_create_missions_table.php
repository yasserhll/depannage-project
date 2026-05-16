<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('depanneur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', [
                'searching',
                'accepted',
                'en_route',
                'arrived',
                'in_progress',
                'completed',
                'cancelled',
                'disputed',
            ])->default('searching');

            // Localisation client
            $table->decimal('client_lat', 10, 8);
            $table->decimal('client_lng', 11, 8);
            $table->string('client_address', 500)->nullable();

            // Panne
            $table->string('breakdown_type', 100);
            $table->text('breakdown_details')->nullable();
            $table->string('vehicle_brand', 100)->nullable();
            $table->string('vehicle_model', 100)->nullable();
            $table->smallInteger('vehicle_year')->unsigned()->nullable();
            $table->string('vehicle_plate', 20)->nullable();

            // Prix
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->decimal('final_price', 10, 2)->nullable();
            $table->decimal('platform_fee', 10, 2)->nullable();
            $table->decimal('depanneur_amount', 10, 2)->nullable();
            $table->char('currency', 3)->default('EUR');

            // Timing
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->enum('cancelled_by', ['client', 'depanneur', 'admin', 'system'])->nullable();
            $table->timestamp('auto_validate_at')->nullable();

            // Distances
            $table->decimal('distance_km', 8, 3)->nullable();
            $table->unsignedInteger('estimated_duration_min')->nullable();

            // Notes
            $table->text('client_notes')->nullable();
            $table->text('depanneur_notes')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('client_id');
            $table->index('depanneur_id');
            $table->index('uuid');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};

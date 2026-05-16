<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depanneur_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('business_name', 200)->nullable();
            $table->text('description')->nullable();
            $table->json('specializations')->nullable();
            $table->unsignedInteger('service_radius_km')->default(20);
            $table->boolean('is_available')->default(false);
            $table->boolean('is_kyc_verified')->default(false);
            $table->enum('kyc_status', ['pending', 'in_review', 'approved', 'rejected'])->default('pending');
            $table->timestamp('kyc_reviewed_at')->nullable();
            $table->foreignId('kyc_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('kyc_notes')->nullable();
            $table->enum('vehicle_type', ['depanneuse', 'remorque', 'utilitaire'])->nullable();
            $table->string('vehicle_plate', 20)->nullable();
            $table->string('vehicle_model', 100)->nullable();
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedInteger('total_missions')->default(0);
            $table->decimal('current_lat', 10, 8)->nullable();
            $table->decimal('current_lng', 11, 8)->nullable();
            $table->timestamp('location_updated_at')->nullable();
            $table->string('bank_account_iban', 50)->nullable();
            $table->string('stripe_account_id', 100)->nullable();
            $table->timestamps();

            $table->index('is_available');
            $table->index(['is_kyc_verified', 'kyc_status']);
            $table->index(['current_lat', 'current_lng']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depanneur_profiles');
    }
};

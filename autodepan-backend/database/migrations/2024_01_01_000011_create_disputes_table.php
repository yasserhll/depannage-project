<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mission_id')->constrained();
            $table->foreignId('opened_by')->constrained('users');
            $table->enum('opened_by_type', ['client', 'depanneur']);
            $table->string('reason', 200);
            $table->text('description')->nullable();
            $table->json('evidence_files')->nullable();
            $table->enum('status', [
                'open',
                'under_review',
                'investigating',
                'awaiting_evidence',
                'resolved',
                'resolved_client',
                'resolved_depanneur',
                'resolved_split',
                'closed',
            ])->default('open');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_note')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};

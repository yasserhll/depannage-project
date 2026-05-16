<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users');
            $table->string('file_path', 500);
            $table->enum('type', ['before', 'during', 'after', 'document'])->default('before');
            $table->timestamp('created_at')->useCurrent();

            $table->index('mission_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_photos');
    }
};

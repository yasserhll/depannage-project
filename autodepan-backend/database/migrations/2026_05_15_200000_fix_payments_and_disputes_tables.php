<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter les colonnes manquantes à payments
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'captured_at')) {
                $table->timestamp('captured_at')->nullable()->after('authorized_at');
            }
            if (!Schema::hasColumn('payments', 'platform_fee')) {
                $table->decimal('platform_fee', 10, 2)->nullable()->after('stripe_metadata');
            }
            if (!Schema::hasColumn('payments', 'depanneur_amount')) {
                $table->decimal('depanneur_amount', 10, 2)->nullable()->after('platform_fee');
            }
        });

        // Harmoniser le statut des litiges : ajouter les valeurs manquantes
        // (under_review, awaiting_evidence, resolved, investigating)
        // Sur MySQL on doit modifier l'ENUM, sur SQLite les ENUMs sont des strings donc pas besoin
        if (config('database.default') === 'mysql') {
            \Illuminate\Support\Facades\DB::statement("
                ALTER TABLE disputes
                MODIFY COLUMN status ENUM(
                    'open',
                    'under_review',
                    'investigating',
                    'awaiting_evidence',
                    'resolved',
                    'resolved_client',
                    'resolved_depanneur',
                    'resolved_split',
                    'closed'
                ) NOT NULL DEFAULT 'open'
            ");
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumnIfExists('captured_at');
            $table->dropColumnIfExists('platform_fee');
            $table->dropColumnIfExists('depanneur_amount');
        });
    }
};

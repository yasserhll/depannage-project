<?php

namespace App\Console\Commands;

use App\Jobs\AutoValidateMission;
use App\Models\Mission;
use Illuminate\Console\Command;

class AutoValidateMissions extends Command
{
    protected $signature   = 'missions:auto-validate';
    protected $description = 'Valide automatiquement les missions complétées depuis plus de 24h.';

    public function handle(): int
    {
        $missions = Mission::where('status', 'completed')
            ->where('auto_validate_at', '<=', now())
            ->whereDoesntHave('dispute')
            ->whereHas('payment', fn($q) => $q->whereIn('status', ['captured', 'authorized']))
            ->get();

        $count = $missions->count();

        if ($count === 0) {
            $this->line('Aucune mission à valider automatiquement.');
            return self::SUCCESS;
        }

        foreach ($missions as $mission) {
            AutoValidateMission::dispatch($mission);
        }

        $this->info("{$count} mission(s) envoyées en validation automatique.");

        return self::SUCCESS;
    }
}

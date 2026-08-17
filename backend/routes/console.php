<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recompute severity/priority for open issues every night.
Schedule::command('ai:priorities')->dailyAt('02:00');

// Dispatch AI analysis for any reports still pending/failed analysis.
Schedule::command('ai:reanalyze')->everyTenMinutes()->withoutOverlapping();

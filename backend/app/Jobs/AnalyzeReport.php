<?php

namespace App\Jobs;

use App\Models\Report;
use App\Services\AiAnalysisService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AnalyzeReport implements ShouldQueue
{
    use Queueable;

    public int $timeout = 120;

    public function __construct(public readonly int $reportId)
    {
    }

    public function handle(AiAnalysisService $ai): void
    {
        $report = Report::find($this->reportId);

        if (! $report) {
            return;
        }

        $analysis = $ai->analyze($report);

        if ($analysis->status === \App\Models\AiAnalysis::STATUS_COMPLETED) {
            $ai->resolveIssueLinkage($report, $analysis);
        }
    }
}

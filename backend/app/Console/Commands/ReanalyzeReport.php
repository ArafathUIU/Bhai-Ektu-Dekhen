<?php

namespace App\Console\Commands;

use App\Jobs\AnalyzeReport;
use App\Models\AiAnalysis;
use App\Models\Report;
use Illuminate\Console\Command;

class ReanalyzeReport extends Command
{
    protected $signature = 'ai:reanalyze {--report= : Specific report ID to re-analyze}';

    protected $description = 'Dispatch AI analysis for reports with failed/pending analyses';

    public function handle(): int
    {
        $query = Report::query();

        if ($reportId = $this->option('report')) {
            $query->where('id', $reportId);
        } else {
            $failed = AiAnalysis::where('status', AiAnalysis::STATUS_FAILED)
                ->pluck('report_id');
            $query->whereIn('id', $failed);
        }

        $count = 0;
        foreach ($query->get() as $report) {
            AnalyzeReport::dispatch($report->id);
            $count++;
        }

        $this->info("Dispatched {$count} report(s) for analysis.");

        return self::SUCCESS;
    }
}
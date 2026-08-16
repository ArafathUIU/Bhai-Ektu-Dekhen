<?php

namespace App\Console\Commands;

use App\Models\Issue;
use App\Services\PriorityScoringService;
use Illuminate\Console\Command;

class RecomputePriorities extends Command
{
    protected $signature = 'ai:priorities';

    protected $description = 'Recompute severity + priority scores for all open issues';

    public function handle(PriorityScoringService $scoring): int
    {
        $issues = Issue::whereNotIn('status', [Issue::STATUS_CLOSED, Issue::STATUS_REJECTED])->get();
        $changed = 0;

        foreach ($issues as $issue) {
            $before = $issue->severity;
            $scoring->apply($issue);
            if ($issue->severity !== $before) {
                $changed++;
            }
        }

        $this->info("Scored {$issues->count()} issues; {$changed} severity updated.");

        return self::SUCCESS;
    }
}
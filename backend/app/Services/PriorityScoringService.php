<?php

namespace App\Services;

use App\Models\Issue;
use Illuminate\Support\Facades\DB;

/**
 * Computes issue priority from AI severity, community support, report count,
 * category weight, and issue age. Purely deterministic signal blending — no
 * external model required (per architecture "Severity Score" formula).
 */
class PriorityScoringService
{
    /**
     * Recompute the combined severity for an issue based on all signals.
     *
     * @return array{severity: string, score: float, breakdown: array}
     */
    public function score(Issue $issue): array
    {
        $ageDays = $this->ageDays($issue);
        $reportCount = $issue->reports()->count();
        $supportCount = $issue->supports()->count();
        $categoryWeight = $this->categoryWeight($issue);
        $aiSeverity = $this->aiSeverityScore($issue);

        // AI visual severity dominates; community + volume + age nudge it.
        $score = ($aiSeverity * 0.45)
            + (min($supportCount / 20, 1.0) * 0.25)
            + (min($reportCount / 5, 1.0) * 0.15)
            + (min($ageDays / 30, 1.0) * 0.10)
            + ($categoryWeight * 0.05);

        // Round to 3 decimals for stable comparison.
        $score = round($score, 3);

        return [
            'severity' => $this->severityBucket($score),
            'score' => $score,
            'breakdown' => [
                'ai_severity' => $aiSeverity,
                'support_score' => min($supportCount / 20, 1.0),
                'volume_score' => min($reportCount / 5, 1.0),
                'age_score' => min($ageDays / 30, 1.0),
                'category_weight' => $categoryWeight,
                'report_count' => $reportCount,
                'support_count' => $supportCount,
                'age_days' => $ageDays,
            ],
        ];
    }

    /**
     * Update the severity field on an issue in place.
     */
    public function apply(Issue $issue): string
    {
        $severity = $this->score($issue)['severity'];

        if ($issue->severity !== $severity) {
            $issue->update(['severity' => $severity]);
        }

        return $severity;
    }

    /**
     * Cluster open issues into hotspots using a fixed cell grid, returning
     * cells that have at least $minIssues issues.
     */
    public function hotspots(float $cellSize = 0.01, int $minIssues = 2): array
    {
        $rows = DB::select(
            <<<'SQL'
                SELECT
                    (FLOOR(longitude / ?::float8) * ?::float8) AS lng,
                    (FLOOR(latitude / ?::float8) * ?::float8) AS lat,
                    COUNT(*) AS issue_count,
                    COUNT(DISTINCT category_id) AS category_count,
                    ROUND(AVG(CASE
                        WHEN severity = 'CRITICAL' THEN 1.0
                        WHEN severity = 'HIGH' THEN 0.7
                        WHEN severity = 'MEDIUM' THEN 0.4
                        ELSE 0.1
                    END)::numeric, 3) AS avg_severity
                FROM issues
                WHERE status NOT IN ('CLOSED', 'REJECTED')
                  AND latitude IS NOT NULL
                  AND longitude IS NOT NULL
                GROUP BY lng, lat
                HAVING COUNT(*) >= ?
                ORDER BY issue_count DESC
                SQL,
            [$cellSize, $cellSize, $cellSize, $cellSize, $minIssues],
        );

        return array_map(static function ($row) {
            return [
                'latitude' => (float) $row->lat,
                'longitude' => (float) $row->lng,
                'issue_count' => (int) $row->issue_count,
                'category_count' => (int) $row->category_count,
                'avg_severity' => (float) $row->avg_severity,
            ];
        }, $rows);
    }

    /**
     * Highest-priority open issues, sorted by computed score descending.
     */
    public function topPriorities(int $limit = 10): array
    {
        $issues = Issue::query()
            ->with(['category', 'reports:id,issue_id', 'supports:id,issue_id'])
            ->whereNotIn('status', [Issue::STATUS_CLOSED, Issue::STATUS_REJECTED])
            ->get();

        $ranked = $issues->map(function (Issue $issue) {
            $result = $this->score($issue);

            return [
                'issue' => $issue,
                'score' => $result['score'],
                'severity' => $result['severity'],
                'breakdown' => $result['breakdown'],
            ];
        })->sortByDesc('score')->values();

        return $ranked->take($limit)->toArray();
    }

    private function aiSeverityScore(Issue $issue): float
    {
        $latest = $issue->reports()
            ->latest()
            ->first()?->analyses()
            ->latest()
            ->first();

        if (! $latest?->severity_score) {
            return 0.4; // no AI data yet -> assume medium
        }

        return (float) $latest->severity_score;
    }

    private function categoryWeight(Issue $issue): float
    {
        return match ($issue->category?->slug) {
            'road_damage', 'drainage' => 0.7,
            'garbage' => 0.5,
            'street_light' => 0.3,
            default => 0.4,
        };
    }

    private function ageDays(Issue $issue): float
    {
        $first = $issue->first_reported_at ?? $issue->created_at;

        return max(0, (int) $first->diffInDays(now()));
    }

    private function severityBucket(float $score): string
    {
        return match (true) {
            $score >= 0.75 => Issue::SEVERITY_CRITICAL,
            $score >= 0.55 => Issue::SEVERITY_HIGH,
            $score >= 0.30 => Issue::SEVERITY_MEDIUM,
            default => Issue::SEVERITY_LOW,
        };
    }
}
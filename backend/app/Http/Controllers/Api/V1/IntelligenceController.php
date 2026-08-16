<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Report;
use App\Services\PriorityScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IntelligenceController extends Controller
{
    public function __construct(private readonly PriorityScoringService $scoring)
    {
    }

    public function hotspots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cell_size' => ['nullable', 'numeric', 'min:0.001', 'max:0.1'],
            'min_issues' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $hotspots = $this->scoring->hotspots(
            (float) ($validated['cell_size'] ?? 0.01),
            (int) ($validated['min_issues'] ?? 2),
        );

        return response()->json(['data' => ['hotspots' => $hotspots]]);
    }

    public function priorities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $priorities = $this->scoring->topPriorities((int) ($validated['limit'] ?? 10));

        return response()->json([
            'data' => [
                'priorities' => array_map(static function (array $row) {
                    return [
                        'issue' => $row['issue'],
                        'score' => $row['score'],
                        'severity' => $row['severity'],
                        'breakdown' => $row['breakdown'],
                    ];
                }, $priorities),
            ],
        ]);
    }

    public function analytics(): JsonResponse
    {
        $totalIssues = Issue::count();
        $openIssues = Issue::whereNotIn('status', [Issue::STATUS_CLOSED, Issue::STATUS_REJECTED])->count();
        $resolvedIssues = Issue::whereIn('status', [Issue::STATUS_RESOLVED, Issue::STATUS_CLOSED])->count();

        $severityBreakdown = Issue::query()
            ->select('severity', DB::raw('COUNT(*) as count'))
            ->whereNotIn('status', [Issue::STATUS_CLOSED, Issue::STATUS_REJECTED])
            ->groupBy('severity')
            ->orderByDesc('count')
            ->pluck('count', 'severity');

        $statusBreakdown = Issue::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->orderByDesc('count')
            ->pluck('count', 'status');

        $categoryBreakdown = IssueCategory::query()
            ->withCount(['issues' => fn ($q) => $q->whereNotIn('status', [Issue::STATUS_CLOSED, Issue::STATUS_REJECTED])])
            ->orderByDesc('issues_count')
            ->get(['id', 'name', 'slug']);

        $reportTrend = Report::query()
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $avgResolutionHours = Issue::query()
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (resolved_at - first_reported_at)) / 3600) as avg_hours')
            ->value('avg_hours');

        return response()->json([
            'data' => [
                'summary' => [
                    'total_issues' => $totalIssues,
                    'open_issues' => $openIssues,
                    'resolved_issues' => $resolvedIssues,
                    'avg_resolution_hours' => $avgResolutionHours !== null
                        ? round((float) $avgResolutionHours, 1)
                        : null,
                ],
                'severity_breakdown' => $severityBreakdown,
                'status_breakdown' => $statusBreakdown,
                'category_breakdown' => $categoryBreakdown,
                'report_trend_14d' => $reportTrend,
            ],
        ]);
    }
}
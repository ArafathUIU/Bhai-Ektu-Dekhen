<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Issue;
use App\Models\Report;
use App\Models\Team;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function __construct(private readonly NotificationService $notifications)
    {
    }
    public function dashboard(): JsonResponse
    {
        $total = Issue::count();
        $byStatus = Issue::selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status');
        $bySeverity = Issue::selectRaw('severity, COUNT(*) as count')->groupBy('severity')->pluck('count', 'severity');
        $pendingReports = Report::whereIn('status', [Report::STATUS_PROCESSING, Report::STATUS_REPORTED])->count();

        return response()->json([
            'data' => [
                'total_issues' => $total,
                'open_issues' => $byStatus->sum() - ($byStatus[Issue::STATUS_RESOLVED] ?? 0) - ($byStatus[Issue::STATUS_CLOSED] ?? 0) - ($byStatus[Issue::STATUS_REJECTED] ?? 0),
                'resolved_issues' => ($byStatus[Issue::STATUS_RESOLVED] ?? 0) + ($byStatus[Issue::STATUS_CLOSED] ?? 0),
                'pending_reports' => $pendingReports,
                'by_status' => $byStatus,
                'by_severity' => $bySeverity,
                'recent_issues' => Issue::with('category')->latest()->limit(10)->get(),
            ],
        ]);
    }

    public function teams(): JsonResponse
    {
        return response()->json([
            'data' => ['teams' => Team::withCount('assignments')->get()],
        ]);
    }

    /**
     * Pending reports awaiting moderator review.
     */
    public function moderationQueue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string'],
        ]);

        $reports = Report::with(['media', 'category', 'user', 'analyses' => fn ($q) => $q->latest()])
            ->whereIn('status', [Report::STATUS_PROCESSING, Report::STATUS_REPORTED])
            ->when($validated['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => ['reports' => $reports],
        ]);
    }

    public function storeTeam(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
        ]);

        $team = Team::create($validated);

        return response()->json([
            'data' => ['team' => $team],
            'message' => 'Team created.',
        ], 201);
    }

    public function assign(Request $request, string $publicId): JsonResponse
    {
        $issue = Issue::where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
            'priority' => ['nullable', Rule::in([
                Issue::SEVERITY_LOW,
                Issue::SEVERITY_MEDIUM,
                Issue::SEVERITY_HIGH,
                Issue::SEVERITY_CRITICAL,
            ])],
            'deadline' => ['nullable', 'date', 'after:now'],
        ]);

        $assignment = DB::transaction(function () use ($issue, $request, $validated) {
            $assignment = Assignment::create([
                'issue_id' => $issue->id,
                'team_id' => $validated['team_id'],
                'assigned_by' => $request->user()->id,
                'priority' => $validated['priority'] ?? $issue->severity,
                'deadline' => $validated['deadline'] ?? null,
                'status' => Assignment::STATUS_PENDING,
                'assigned_at' => now(),
            ]);

            if ($issue->status === Issue::STATUS_VERIFIED) {
                $issue->update(['status' => Issue::STATUS_ASSIGNED]);
            }

            return $assignment;
        });

        return response()->json([
            'data' => ['assignment' => $assignment->load('team')],
            'message' => 'Issue assigned to team.',
        ], 201);
    }

    public function assignments(): JsonResponse
    {
        $assignments = Assignment::with(['issue.category', 'team', 'assignedBy'])->latest()->paginate(15);

        return response()->json([
            'data' => ['assignments' => $assignments],
        ]);
    }

    public function updateAssignmentStatus(Request $request, Assignment $assignment): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([
                Assignment::STATUS_PENDING,
                Assignment::STATUS_IN_PROGRESS,
                Assignment::STATUS_COMPLETED,
                Assignment::STATUS_CANCELLED,
            ])],
        ]);

        $assignment->update([
            'status' => $validated['status'],
            'completed_at' => $validated['status'] === Assignment::STATUS_COMPLETED ? now() : null,
        ]);

        if ($validated['status'] === Assignment::STATUS_COMPLETED) {
            $this->notifications->notifyIssueReporters(
                $assignment->issue,
                \App\Models\Notification::TYPE_ISSUE_RESOLVED,
                "Issue {$assignment->issue->public_id} work completed",
                'The assigned team marked the work as completed.',
            );
        }

        return response()->json([
            'data' => ['assignment' => $assignment->load('team')],
            'message' => 'Assignment status updated.',
        ]);
    }
}

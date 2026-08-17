<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Report;
use App\Services\IssueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IssueController extends Controller
{
    public function __construct(private readonly IssueService $issues)
    {
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => ['categories' => IssueCategory::orderBy('name')->get()],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Issue::query()->with('category');

        if ($request->has('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->input('category')));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->input('severity'));
        }

        return response()->json([
            'data' => ['issues' => $query->latest()->paginate(15)],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $issue = Issue::where('public_id', $publicId)
            ->with(['category', 'reports.media', 'reports.user', 'statusHistory.changedBy', 'supports'])
            ->firstOrFail();

        return response()->json([
            'data' => ['issue' => $issue],
        ]);
    }

    public function createFromReport(Request $request, Report $report): JsonResponse
    {
        $validated = $request->validate([
            'severity' => ['nullable', Rule::in([
                Issue::SEVERITY_LOW,
                Issue::SEVERITY_MEDIUM,
                Issue::SEVERITY_HIGH,
                Issue::SEVERITY_CRITICAL,
            ])],
        ]);

        if ($report->issue_id !== null) {
            return response()->json([
                'message' => 'This report is already linked to an issue.',
            ], 409);
        }

        $issue = $this->issues->createIssueFromReport(
            $report,
            $validated['severity'] ?? Issue::SEVERITY_MEDIUM,
        );

        return response()->json([
            'data' => ['issue' => $issue->load('category')],
            'message' => 'Issue created from report.',
        ], 201);
    }

    public function updateStatus(Request $request, string $publicId): JsonResponse
    {
        $issue = Issue::where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                Issue::STATUS_UNDER_REVIEW,
                Issue::STATUS_VERIFIED,
                Issue::STATUS_ASSIGNED,
                Issue::STATUS_IN_PROGRESS,
                Issue::STATUS_RESOLVED,
                Issue::STATUS_CLOSED,
                Issue::STATUS_REOPENED,
                Issue::STATUS_REJECTED,
            ])],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $issue = $this->issues->changeStatus(
            $issue,
            $validated['status'],
            $request->user()->id,
            $validated['reason'] ?? null,
        );

        return response()->json([
            'data' => ['issue' => $issue->load('statusHistory')],
            'message' => 'Issue status updated.',
        ]);
    }

    public function updateSeverity(Request $request, string $publicId): JsonResponse
    {
        $issue = Issue::where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'severity' => ['required', Rule::in([
                Issue::SEVERITY_LOW,
                Issue::SEVERITY_MEDIUM,
                Issue::SEVERITY_HIGH,
                Issue::SEVERITY_CRITICAL,
            ])],
        ]);

        $issue->update(['severity' => $validated['severity']]);

        return response()->json([
            'data' => ['issue' => $issue],
            'message' => 'Issue severity updated.',
        ]);
    }

    public function support(string $publicId, Request $request): JsonResponse
    {
        $issue = Issue::where('public_id', $publicId)->firstOrFail();

        $this->issues->addSupport($issue, $request->user()->id);

        return response()->json([
            'data' => ['support_count' => $issue->supports()->count()],
            'message' => 'Issue supported.',
        ]);
    }
}

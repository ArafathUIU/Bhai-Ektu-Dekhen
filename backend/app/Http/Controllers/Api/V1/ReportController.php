<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeReport;
use App\Models\Issue;
use App\Models\Media;
use App\Models\Notification;
use App\Models\Report;
use App\Services\IssueService;
use App\Services\NotificationService;
use App\Services\PublicIdGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function __construct(
        private readonly PublicIdGenerator $ids,
        private readonly NotificationService $notifications,
    ) {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['nullable', 'exists:issue_categories,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ]);

        $user = $request->user();

        $report = DB::transaction(function () use ($user, $validated) {
            $report = new Report([
                'user_id' => $user->id,
                'category_id' => $validated['category_id'] ?? null,
                'description' => $validated['description'] ?? null,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'status' => Report::STATUS_PROCESSING,
            ]);
            $report->save();

            $report->public_id = $this->ids->reportId($report->id);
            $report->save();

            DB::statement(
                'UPDATE reports SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
                [$validated['longitude'], $validated['latitude'], $report->id],
            );

            return $report;
        });

        $path = $request->file('photo')->store('reports/'.now()->format('Y/m'), 'public');

        Media::create([
            'user_id' => $user->id,
            'mediable_type' => Report::class,
            'mediable_id' => $report->id,
            'type' => Media::TYPE_REPORT_PHOTO,
            'storage_key' => $path,
            'url' => $path,
            'mime_type' => $request->file('photo')->getMimeType(),
            'size' => $request->file('photo')->getSize(),
        ]);

        AnalyzeReport::dispatch($report->id);

        return response()->json([
            'data' => [
                'report' => $report->load(['media', 'category']),
            ],
            'message' => 'Report submitted. Status is PROCESSING.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $reports = $request->user()->reports()
            ->with(['media', 'category', 'analyses' => fn ($q) => $q->latest()])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => ['reports' => $reports],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $report = Report::where('public_id', $publicId)
            ->with(['media', 'category', 'issue', 'user'])
            ->firstOrFail();

        return response()->json([
            'data' => ['report' => $report],
        ]);
    }

    /**
     * Moderator/admin: verify a report so it becomes a confirmed issue.
     */
    public function verify(Request $request, string $publicId): JsonResponse
    {
        $report = Report::where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'severity' => ['nullable', Rule::in([
                Issue::SEVERITY_LOW,
                Issue::SEVERITY_MEDIUM,
                Issue::SEVERITY_HIGH,
                Issue::SEVERITY_CRITICAL,
            ])],
        ]);

        DB::transaction(function () use ($report, $validated, $request) {
            $report->update(['status' => Report::STATUS_REPORTED]);

            if (! $report->issue_id) {
                app(IssueService::class)->createIssueFromReport(
                    $report,
                    $validated['severity'] ?? null,
                );
            }
        });

        $this->notifications->notifyReportAuthor(
            $report->refresh(),
            Notification::TYPE_REPORT_VERIFIED,
            'Your report was verified',
            'A moderator confirmed your report and an issue is being tracked.',
        );

        return response()->json([
            'data' => ['report' => $report->refresh()->load(['media', 'category', 'issue'])],
            'message' => 'Report verified.',
        ]);
    }

    /**
     * Moderator/admin: reject a report as invalid or a duplicate.
     */
    public function reject(Request $request, string $publicId): JsonResponse
    {
        $report = Report::where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $report->update(['status' => Report::STATUS_REJECTED]);

        $this->notifications->notifyReportAuthor(
            $report,
            Notification::TYPE_REPORT_REJECTED,
            'Your report was rejected',
            $validated['reason'] ?? 'This report could not be verified.',
        );

        return response()->json([
            'data' => ['report' => $report->refresh()->load('media')],
            'message' => 'Report rejected.',
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\IssueStatusHistory;
use App\Models\Report;
use Illuminate\Support\Facades\DB;

class IssueService
{
    public function __construct(private readonly PublicIdGenerator $ids)
    {
    }

    public function createIssueFromReport(Report $report, ?string $severity = null): Issue
    {
        return DB::transaction(function () use ($report, $severity) {
            $issue = new Issue([
                'category_id' => $report->category_id,
                'title' => $this->buildTitle($report),
                'description' => $report->description,
                'latitude' => $report->latitude,
                'longitude' => $report->longitude,
                'severity' => $severity ?? Issue::SEVERITY_MEDIUM,
                'status' => Issue::STATUS_REPORTED,
                'first_reported_at' => now(),
                'last_reported_at' => now(),
            ]);
            $issue->save();

            $issue->public_id = $this->ids->issueId($issue->id);
            $issue->save();

            DB::statement(
                'UPDATE issues SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
                [$report->longitude, $report->latitude, $issue->id],
            );

            $report->issue_id = $issue->id;
            $report->status = Report::STATUS_REPORTED;
            $report->save();

            $this->recordStatus($issue, null, Issue::STATUS_REPORTED);

            return $issue;
        });
    }

    public function changeStatus(Issue $issue, string $newStatus, int $changedBy, ?string $reason = null): Issue
    {
        $oldStatus = $issue->status;

        if ($oldStatus === $newStatus) {
            return $issue;
        }

        return DB::transaction(function () use ($issue, $newStatus, $changedBy, $reason, $oldStatus) {
            $issue->status = $newStatus;

            if ($newStatus === Issue::STATUS_RESOLVED) {
                $issue->resolved_at = now();
            }

            $issue->save();
            $this->recordStatus($issue, $oldStatus, $newStatus, $changedBy, $reason);

            return $issue;
        });
    }

    public function addSupport(Issue $issue, int $userId): void
    {
        $issue->supports()->firstOrCreate(['user_id' => $userId]);
    }

    private function recordStatus(Issue $issue, ?string $from, string $to, ?int $changedBy = null, ?string $reason = null): void
    {
        IssueStatusHistory::create([
            'issue_id' => $issue->id,
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => $changedBy,
            'reason' => $reason,
        ]);
    }

    private function buildTitle(Report $report): string
    {
        $category = $report->category?->name;

        return $category ? ucfirst($category).' issue' : 'Reported issue';
    }
}

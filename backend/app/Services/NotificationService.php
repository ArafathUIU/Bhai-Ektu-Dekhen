<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\Notification;
use App\Models\Report;
use App\Models\User;

class NotificationService
{
    public function notify(int $userId, string $type, string $title, ?string $message = null, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Notify every reporter of an issue when its status changes.
     */
    public function notifyIssueReporters(Issue $issue, string $type, string $title, ?string $message = null): void
    {
        $reporterIds = $issue->reports()
            ->whereNotNull('user_id')
            ->pluck('user_id')
            ->unique();

        foreach ($reporterIds as $userId) {
            $this->notify($userId, $type, $title, $message, [
                'issue_id' => $issue->id,
                'issue_public_id' => $issue->public_id,
            ]);
        }
    }

    /**
     * Notify the author of a single report (e.g. verified / rejected / duplicate).
     */
    public function notifyReportAuthor(Report $report, string $type, string $title, ?string $message = null): void
    {
        if (! $report->user_id) {
            return;
        }

        $this->notify($report->user_id, $type, $title, $message, [
            'report_id' => $report->id,
            'report_public_id' => $report->public_id,
        ]);
    }

    public function notifyTeamMember(int $userId, Issue $issue, string $type, string $title, ?string $message = null): void
    {
        $this->notify($userId, $type, $title, $message, [
            'issue_id' => $issue->id,
            'issue_public_id' => $issue->public_id,
        ]);
    }

    public function unreadCountFor(User $user): int
    {
        return Notification::query()->unread()->where('user_id', $user->id)->count();
    }
}
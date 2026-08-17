<?php

namespace Tests\Feature;

use App\Models\IssueCategory;
use App\Models\Notification;
use App\Models\Report;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModerationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\IssueCategorySeeder::class);
    }

    private function reporterWithToken(): array
    {
        $user = User::factory()->create();

        return [$user, $user->createToken('auth-token')->plainTextToken];
    }

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role_id' => Role::where('slug', Role::ADMIN)->first()->id]);

        return $admin->createToken('auth-token')->plainTextToken;
    }

    private function createProcessingReport(int $userId): Report
    {
        $report = new Report([
            'user_id' => $userId,
            'category_id' => IssueCategory::first()->id,
            'description' => 'Moderation test report',
            'latitude' => 24.75,
            'longitude' => 90.40,
            'status' => Report::STATUS_PROCESSING,
        ]);
        $report->public_id = 'BEK-'.str_pad((string) mt_rand(10000, 99999), 5, '0', STR_PAD_LEFT);
        $report->save();

        return $report;
    }

    public function test_verify_creates_issue_and_notifies(): void
    {
        [$reporter] = $this->reporterWithToken();
        $report = $this->createProcessingReport($reporter->id);
        $admin = $this->adminToken();

        $response = $this->postJson("/api/v1/reports/{$report->public_id}/verify", [], [
            'Authorization' => "Bearer {$admin}",
        ]);

        $response->assertOk()
            ->assertJsonPath('data.report.status', Report::STATUS_REPORTED)
            ->assertJsonStructure(['data' => ['report' => ['issue']]]);

        $this->assertNotNull($report->refresh()->issue_id);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $reporter->id,
            'type' => Notification::TYPE_REPORT_VERIFIED,
        ]);
    }

    public function test_reject_marks_report_rejected_and_notifies(): void
    {
        [$reporter] = $this->reporterWithToken();
        $report = $this->createProcessingReport($reporter->id);
        $admin = $this->adminToken();

        $this->postJson("/api/v1/reports/{$report->public_id}/reject", [
            'reason' => 'Not an actual problem',
        ], ['Authorization' => "Bearer {$admin}"])
            ->assertOk()
            ->assertJsonPath('data.report.status', Report::STATUS_REJECTED);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $reporter->id,
            'type' => Notification::TYPE_REPORT_REJECTED,
        ]);
    }

    public function test_citizen_cannot_moderate(): void
    {
        [$reporter, $token] = $this->reporterWithToken();
        $report = $this->createProcessingReport($reporter->id);

        $this->postJson("/api/v1/reports/{$report->public_id}/verify", [], [
            'Authorization' => "Bearer {$token}",
        ])->assertForbidden();
    }

    public function test_moderation_queue_lists_pending_reports(): void
    {
        [$reporter] = $this->reporterWithToken();
        $this->createProcessingReport($reporter->id);
        $this->createProcessingReport($reporter->id);
        $admin = $this->adminToken();

        $response = $this->getJson('/api/v1/admin/moderation', [
            'Authorization' => "Bearer {$admin}",
        ]);

        $response->assertOk()
            ->assertJsonCount(2, 'data.reports.data');
    }

    public function test_moderation_queue_excludes_resolved_reports(): void
    {
        [$reporter] = $this->reporterWithToken();
        $this->createProcessingReport($reporter->id);
        $rejected = $this->createProcessingReport($reporter->id);
        $rejected->update(['status' => Report::STATUS_REJECTED]);
        $admin = $this->adminToken();

        $this->getJson('/api/v1/admin/moderation', [
            'Authorization' => "Bearer {$admin}",
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.reports.data');
    }

    public function test_moderation_queue_requires_admin(): void
    {
        [, $token] = $this->reporterWithToken();

        $this->getJson('/api/v1/admin/moderation', [
            'Authorization' => "Bearer {$token}",
        ])->assertForbidden();
    }
}
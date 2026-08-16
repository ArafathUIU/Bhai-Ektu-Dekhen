<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use App\Services\IssueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\IssueCategorySeeder::class);
    }

    private function issueWithReporter(): array
    {
        $reporter = User::factory()->create();
        $issue = app(IssueService::class)->createIssueFromReport(
            \App\Models\Report::factory()->create([
                'user_id' => $reporter->id,
                'category_id' => IssueCategory::first()->id,
            ]),
        );

        return [$reporter, $issue];
    }

    public function test_issue_resolution_notifies_reporter(): void
    {
        [$reporter, $issue] = $this->issueWithReporter();
        $admin = User::factory()->create(['role_id' => Role::where('slug', Role::ADMIN)->first()->id]);
        $token = $admin->createToken('auth-token')->plainTextToken;

        $this->patchJson("/api/v1/issues/{$issue->public_id}/status", [
            'status' => Issue::STATUS_RESOLVED,
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $reporter->id,
            'type' => Notification::TYPE_ISSUE_RESOLVED,
        ]);
    }

    public function test_user_can_list_and_mark_notifications(): void
    {
        [$reporter, $issue] = $this->issueWithReporter();
        $token = $reporter->createToken('auth-token')->plainTextToken;

        $this->getJson('/api/v1/notifications', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.unread_count', 0);

        app(\App\Services\NotificationService::class)->notify(
            $reporter->id,
            Notification::TYPE_REPORT_VERIFIED,
            'Report verified',
        );

        $list = $this->getJson('/api/v1/notifications', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.unread_count', 1);

        $id = $list->json('data.notifications.data.0.id');

        $this->postJson("/api/v1/notifications/{$id}/read", [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();

        $this->getJson('/api/v1/notifications/unread-count', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.unread_count', 0);
    }

    public function test_cannot_read_others_notifications(): void
    {
        [$reporter, $issue] = $this->issueWithReporter();
        $notification = app(\App\Services\NotificationService::class)->notify(
            $reporter->id,
            Notification::TYPE_REPORT_VERIFIED,
            'Report verified',
        );

        $other = User::factory()->create();
        $token = $other->createToken('auth-token')->plainTextToken;

        $this->postJson("/api/v1/notifications/{$notification->id}/read", [], [
            'Authorization' => "Bearer {$token}",
        ])->assertForbidden();
    }
}
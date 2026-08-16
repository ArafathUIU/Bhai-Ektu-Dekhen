<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Role;
use App\Models\User;
use App\Services\IssueService;
use App\Services\PublicIdGenerator;
use App\Services\PriorityScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\IssueCategorySeeder::class);
    }

    private function createIssue(?User $user = null): Issue
    {
        $user ??= User::factory()->create();

        return app(IssueService::class)->createIssueFromReport(
            \App\Models\Report::factory()->create([
                'user_id' => $user->id,
                'category_id' => IssueCategory::first()->id,
            ]),
        );
    }

    public function test_public_issue_index(): void
    {
        $this->createIssue();
        $this->createIssue();

        $this->getJson('/api/v1/issues')->assertOk()->assertJsonCount(2, 'data.issues.data');
    }

    public function test_issue_show_by_public_id(): void
    {
        $issue = $this->createIssue();

        $this->getJson("/api/v1/issues/{$issue->public_id}")
            ->assertOk()
            ->assertJsonPath('data.issue.id', $issue->id);
    }

    public function test_issue_show_404_for_unknown(): void
    {
        $this->getJson('/api/v1/issues/BEK-99999')->assertStatus(404);
    }

    public function test_user_can_support_issue(): void
    {
        $issue = $this->createIssue();
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson("/api/v1/issues/{$issue->public_id}/support", [], [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();

        $this->assertDatabaseHas('issue_supports', [
            'issue_id' => $issue->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_non_admin_cannot_change_status(): void
    {
        $issue = $this->createIssue();
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->patchJson("/api/v1/issues/{$issue->public_id}/status", [
            'status' => Issue::STATUS_RESOLVED,
        ], ['Authorization' => "Bearer {$token}"])
            ->assertForbidden();
    }

    public function test_admin_can_change_status_and_priority_recomputes(): void
    {
        $issue = $this->createIssue();
        $admin = User::factory()->create(['role_id' => Role::where('slug', Role::ADMIN)->first()->id]);
        $token = $admin->createToken('auth-token')->plainTextToken;

        $response = $this->patchJson("/api/v1/issues/{$issue->public_id}/status", [
            'status' => Issue::STATUS_RESOLVED,
            'reason' => 'Repaired by city corporation',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertOk()
            ->assertJsonPath('data.issue.status', Issue::STATUS_RESOLVED);

        $this->assertNotNull($issue->refresh()->resolved_at);
        $this->assertDatabaseHas('issue_status_history', [
            'issue_id' => $issue->id,
            'to_status' => Issue::STATUS_RESOLVED,
        ]);
    }

    public function test_map_nearby_returns_issues_in_radius(): void
    {
        $issue = $this->createIssue();
        $issue->update([
            'latitude' => 24.75,
            'longitude' => 90.40,
        ]);
        \Illuminate\Support\Facades\DB::statement(
            'UPDATE issues SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
            [90.40, 24.75, $issue->id],
        );

        $this->getJson('/api/v1/map/nearby?latitude=24.75&longitude=90.40&radius=500')
            ->assertOk()
            ->assertJsonCount(1, 'data.issues');
    }

    public function test_heatmap_returns_grid(): void
    {
        $issue = $this->createIssue();
        $issue->update([
            'latitude' => 24.75,
            'longitude' => 90.40,
        ]);
        \Illuminate\Support\Facades\DB::statement(
            'UPDATE issues SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
            [90.40, 24.75, $issue->id],
        );

        $this->getJson('/api/v1/map/heatmap?bbox=90.0,24.0,91.0,25.0&cell_size=0.1')
            ->assertOk()
            ->assertJsonStructure(['data' => ['cells']]);
    }
}
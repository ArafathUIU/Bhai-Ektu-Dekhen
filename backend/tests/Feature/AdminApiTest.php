<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Report;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use App\Services\IssueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\IssueCategorySeeder::class);
    }

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role_id' => Role::where('slug', Role::ADMIN)->first()->id]);

        return $admin->createToken('auth-token')->plainTextToken;
    }

    private function issue(): Issue
    {
        return app(IssueService::class)->createIssueFromReport(
            Report::factory()->create(['category_id' => IssueCategory::first()->id]),
        );
    }

    public function test_dashboard_requires_admin(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->getJson('/api/v1/admin/dashboard', ['Authorization' => "Bearer {$token}"])
            ->assertForbidden();
    }

    public function test_dashboard_returns_counts(): void
    {
        $this->issue();
        $this->issue();

        $this->getJson('/api/v1/admin/dashboard', ['Authorization' => "Bearer {$this->adminToken()}"])
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['total_issues', 'open_issues', 'pending_reports', 'by_status', 'by_severity', 'recent_issues'],
            ]);
    }

    public function test_team_crud(): void
    {
        $token = $this->adminToken();

        $created = $this->postJson('/api/v1/admin/teams', [
            'name' => 'City Road Repair Unit',
            'department' => 'Civic Works',
        ], ['Authorization' => "Bearer {$token}"])
            ->assertCreated()
            ->assertJsonPath('data.team.name', 'City Road Repair Unit');

        $teamId = $created->json('data.team.id');

        $this->getJson('/api/v1/admin/teams', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonFragment(['name' => 'City Road Repair Unit']);
    }

    public function test_assign_issue_to_team(): void
    {
        $issue = $this->issue();
        $team = Team::create(['name' => 'Drainage Crew']);
        $token = $this->adminToken();

        $this->postJson("/api/v1/admin/issues/{$issue->public_id}/assign", [
            'team_id' => $team->id,
            'priority' => Issue::SEVERITY_HIGH,
        ], ['Authorization' => "Bearer {$token}"])
            ->assertCreated()
            ->assertJsonPath('data.assignment.team_id', $team->id);

        $this->assertDatabaseHas('assignments', [
            'issue_id' => $issue->id,
            'team_id' => $team->id,
            'status' => Assignment::STATUS_PENDING,
        ]);
    }

    public function test_assign_requires_existing_team(): void
    {
        $issue = $this->issue();
        $token = $this->adminToken();

        $this->postJson("/api/v1/admin/issues/{$issue->public_id}/assign", [
            'team_id' => 99999,
        ], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
    }
}
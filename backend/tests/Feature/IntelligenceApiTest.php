<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Report;
use App\Models\Role;
use App\Models\User;
use App\Services\IssueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class IntelligenceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\IssueCategorySeeder::class);
    }

    private function issueAt(float $lat, float $lng): Issue
    {
        $user = User::factory()->create();
        $issue = app(IssueService::class)->createIssueFromReport(
            Report::factory()->create([
                'user_id' => $user->id,
                'category_id' => IssueCategory::first()->id,
                'latitude' => $lat,
                'longitude' => $lng,
            ]),
        );
        DB::statement(
            'UPDATE issues SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
            [$lng, $lat, $issue->id],
        );

        return $issue;
    }

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role_id' => Role::where('slug', Role::ADMIN)->first()->id]);

        return $admin->createToken('auth-token')->plainTextToken;
    }

    public function test_hotspots_detects_clusters(): void
    {
        $this->issueAt(24.750, 90.400);
        $this->issueAt(24.751, 90.401);
        $this->issueAt(24.752, 90.402);

        $response = $this->getJson('/api/v1/intelligence/hotspots?cell_size=0.05&min_issues=2')
            ->assertOk();

        $hotspots = $response->json('data.hotspots');
        $this->assertNotEmpty($hotspots);
        $this->assertGreaterThanOrEqual(2, $hotspots[0]['issue_count']);
    }

    public function test_analytics_returns_summary(): void
    {
        $this->issueAt(24.750, 90.400);

        $response = $this->getJson('/api/v1/intelligence/analytics')->assertOk();

        $summary = $response->json('data.summary');
        $this->assertSame(1, $summary['total_issues']);
        $this->assertArrayHasKey('severity_breakdown', $response->json('data'));
        $this->assertArrayHasKey('status_breakdown', $response->json('data'));
        $this->assertArrayHasKey('category_breakdown', $response->json('data'));
    }

    public function test_priorities_requires_admin(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->getJson('/api/v1/intelligence/priorities', ['Authorization' => "Bearer {$token}"])
            ->assertForbidden();
    }

    public function test_priorities_returns_ranked_list_for_admin(): void
    {
        $this->issueAt(24.750, 90.400);
        $this->issueAt(24.751, 90.401);
        $token = $this->adminToken();

        $this->getJson('/api/v1/intelligence/priorities?limit=2', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonCount(2, 'data.priorities');
    }
}
<?php

namespace Tests\Feature;

use App\Models\IssueCategory;
use App\Models\Media;
use App\Models\Report;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\IssueCategorySeeder::class);
        Storage::fake('public');
    }

    private function authUser(): array
    {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        return [$user, $user->createToken('auth-token')->plainTextToken];
    }

    public function test_create_report_requires_auth(): void
    {
        $this->postJson('/api/v1/reports')->assertStatus(401);
    }

    public function test_user_can_create_report_with_photo(): void
    {
        Queue::fake();
        [, $token] = $this->authUser();

        $response = $this->postJson('/api/v1/reports', [
            'category_id' => IssueCategory::first()->id,
            'description' => 'Boro gort er shamne',
            'latitude' => 24.75,
            'longitude' => 90.40,
            'photo' => UploadedFile::fake()->image('pothole.jpg', 100, 100),
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertCreated()
            ->assertJsonPath('data.report.status', Report::STATUS_PROCESSING)
            ->assertJsonStructure(['data' => ['report' => ['id', 'public_id', 'media']]]);

        $this->assertDatabaseHas('reports', ['description' => 'Boro gort er shamne']);
        $this->assertSame(1, Media::count());
    }

    public function test_create_report_validates_photo(): void
    {
        [, $token] = $this->authUser();

        $this->postJson('/api/v1/reports', [
            'latitude' => 24.75,
            'longitude' => 90.40,
        ], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
    }

    public function test_user_can_list_own_reports(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        Report::factory()->count(3)->create(['user_id' => $user->id]);
        Report::factory()->create(['user_id' => User::factory()->create()->id]);

        $this->getJson('/api/v1/reports', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonCount(3, 'data.reports.data');
    }

    public function test_reports_include_linked_issue_public_id(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;
        $report = Report::factory()->create(['user_id' => $user->id]);

        $issue = app(\App\Services\IssueService::class)->createIssueFromReport($report);

        $this->getJson('/api/v1/reports', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.reports.data.0.issue.public_id', $issue->public_id);
    }
}
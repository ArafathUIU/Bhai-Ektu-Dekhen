<?php

namespace Tests\Feature;

use App\Models\AiAnalysis;
use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\IssueMatch;
use App\Models\Media;
use App\Models\Report;
use App\Models\Role;
use App\Models\User;
use App\Services\AiAnalysisService;
use App\Services\IssueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AiDuplicateDetectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\IssueCategorySeeder::class);
        Storage::fake('public');
    }

    private function reportWithPhoto(array $overrides = []): Report
    {
        $user = User::factory()->create();
        $report = Report::factory()->create([
            'user_id' => $user->id,
            'category_id' => IssueCategory::first()->id,
            'latitude' => $overrides['latitude'] ?? 24.750,
            'longitude' => $overrides['longitude'] ?? 90.400,
            'description' => $overrides['description'] ?? 'Pothole near the market',
        ]);

        $path = UploadedFile::fake()->image('photo.jpg', 100, 100)->store('reports/2026/08', 'public');
        Media::create([
            'user_id' => $user->id,
            'mediable_type' => Report::class,
            'mediable_id' => $report->id,
            'type' => Media::TYPE_REPORT_PHOTO,
            'storage_key' => $path,
            'url' => $path,
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        return $report;
    }

    private function fakeWorker(array $embedding = [0.5, 0.5, 0.5]): void
    {
        Http::fake([
            '*' => Http::response([
                'report_id' => 1,
                'public_id' => 'BEK-00001',
                'status' => 'COMPLETED',
                'classification' => [
                    'category_slug' => 'road_damage',
                    'category_name' => 'Road Damage',
                    'confidence' => 0.91,
                ],
                'severity_score' => 0.87,
                'embedding' => $embedding,
                'embedding_dim' => count($embedding),
                'processing_time_ms' => 12,
                'model_name' => 'test-classifier',
                'model_version' => '1',
            ]),
        ]);
    }

    public function test_analyze_completes_and_persists_analysis(): void
    {
        $this->fakeWorker();
        $report = $this->reportWithPhoto();

        $analysis = app(AiAnalysisService::class)->analyze($report);

        $this->assertSame(AiAnalysis::STATUS_COMPLETED, $analysis->status);
        $this->assertSame('road_damage', $analysis->predicted_category_slug);
        $this->assertSame(0.91, (float) $analysis->confidence);
        $this->assertSame(0.87, (float) $analysis->severity_score);
        $this->assertSame([0.5, 0.5, 0.5], $analysis->embedding);
    }

    public function test_analyze_marks_failed_on_worker_error(): void
    {
        Http::fake(['*' => Http::response('boom', 500)]);
        $report = $this->reportWithPhoto();

        $analysis = app(AiAnalysisService::class)->analyze($report);

        $this->assertSame(AiAnalysis::STATUS_FAILED, $analysis->status);
    }

    public function test_duplicate_report_is_merged_into_nearby_issue(): void
    {
        $this->fakeWorker($embedding = [1.0, 0.0, 0.0]);

        // Existing issue with an already-analyzed report at the same spot.
        $first = $this->reportWithPhoto(['description' => 'Pothole near the market']);
        $existing = app(IssueService::class)->createIssueFromReport($first);
        app(AiAnalysisService::class)->analyze($first);

        // Second, near-identical report — same coordinates + description.
        $second = $this->reportWithPhoto(['description' => 'pothole near the market']);
        $analysis = app(AiAnalysisService::class)->analyze($second);
        app(AiAnalysisService::class)->resolveIssueLinkage($second, $analysis);

        $this->assertSame($existing->id, $second->refresh()->issue_id);
        $this->assertDatabaseHas('issue_matches', [
            'report_id' => $second->id,
            'issue_id' => $existing->id,
            'decision' => IssueMatch::DECISION_MERGED,
        ]);
    }

    public function test_far_away_report_creates_a_new_issue(): void
    {
        $this->fakeWorker([1.0, 0.0, 0.0]);

        $first = $this->reportWithPhoto();
        app(IssueService::class)->createIssueFromReport($first);
        app(AiAnalysisService::class)->analyze($first);

        $far = $this->reportWithPhoto(['latitude' => 24.0, 'longitude' => 90.0]);
        $analysis = app(AiAnalysisService::class)->analyze($far);
        app(AiAnalysisService::class)->resolveIssueLinkage($far, $analysis);

        $this->assertNotNull($far->refresh()->issue_id);
        $this->assertNotSame($first->issue_id, $far->issue_id);
    }
}
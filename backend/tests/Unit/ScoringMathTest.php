<?php

namespace Tests\Unit;

use App\Models\Issue;
use App\Services\AiAnalysisService;
use App\Services\IssueService;
use App\Services\PriorityScoringService;
use Tests\TestCase;
use ReflectionMethod;

class ScoringMathTest extends TestCase
{
    private function invoke(object $object, string $method, mixed ...$args): mixed
    {
        $reflection = new ReflectionMethod($object, $method);
        $reflection->setAccessible(true);

        return $reflection->invoke($object, ...$args);
    }

    public function test_severity_bucket_boundaries(): void
    {
        $service = new PriorityScoringService();

        $this->assertSame(Issue::SEVERITY_CRITICAL, $this->invoke($service, 'severityBucket', 0.75));
        $this->assertSame(Issue::SEVERITY_HIGH, $this->invoke($service, 'severityBucket', 0.55));
        $this->assertSame(Issue::SEVERITY_MEDIUM, $this->invoke($service, 'severityBucket', 0.30));
        $this->assertSame(Issue::SEVERITY_LOW, $this->invoke($service, 'severityBucket', 0.29));
        $this->assertSame(Issue::SEVERITY_HIGH, $this->invoke($service, 'severityBucket', 0.60));
        $this->assertSame(Issue::SEVERITY_CRITICAL, $this->invoke($service, 'severityBucket', 0.99));
    }

    public function test_category_weight_mapping(): void
    {
        $service = new PriorityScoringService();

        $this->assertSame(0.7, $this->invoke($service, 'categoryWeight', $this->issueWithCategory('road_damage')));
        $this->assertSame(0.7, $this->invoke($service, 'categoryWeight', $this->issueWithCategory('drainage')));
        $this->assertSame(0.5, $this->invoke($service, 'categoryWeight', $this->issueWithCategory('garbage')));
        $this->assertSame(0.3, $this->invoke($service, 'categoryWeight', $this->issueWithCategory('street_light')));
        $this->assertSame(0.4, $this->invoke($service, 'categoryWeight', new Issue()));
    }

    private function issueWithCategory(string $slug): Issue
    {
        $issue = new Issue();
        $issue->setRelation('category', new \App\Models\IssueCategory(['slug' => $slug]));

        return $issue;
    }

    public function test_cosine_identical_vectors_is_one(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $this->assertSame(1.0, $this->invoke($service, 'cosine', [1.0, 0.0, 1.0], [1.0, 0.0, 1.0]));
    }

    public function test_cosine_orthogonal_vectors_is_zero(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $this->assertSame(0.0, $this->invoke($service, 'cosine', [1.0, 0.0], [0.0, 1.0]));
    }

    public function test_cosine_dimension_mismatch_returns_zero(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $this->assertSame(0.0, $this->invoke($service, 'cosine', [1.0, 0.0], [1.0]));
    }

    public function test_cosine_ignores_empty_vectors(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $this->assertSame(0.0, $this->invoke($service, 'cosine', [], []));
    }

    public function test_text_similarity_exact_match_is_one(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $this->assertSame(1.0, $this->invoke($service, 'textSimilarity', 'Pothole on Main Street', 'pothole on main street'));
    }

    public function test_text_similarity_missing_input_is_zero(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $this->assertSame(0.0, $this->invoke($service, 'textSimilarity', null, 'Pothole'));
        $this->assertSame(0.0, $this->invoke($service, 'textSimilarity', 'Pothole', null));
    }

    public function test_combined_similarity_prefers_proximity(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $near = $this->invoke($service, 'combineSimilarities', 0.0, 1.0, 1.0, 300.0);
        $far = $this->invoke($service, 'combineSimilarities', 300.0, 1.0, 1.0, 300.0);

        $this->assertGreaterThan($far, $near);
        $this->assertSame(1.0, $near); // 1.0*0.2 + 1.0*0.5 + 1.0*0.3
    }

    public function test_severity_to_enum_boundaries(): void
    {
        $service = new AiAnalysisService(app(IssueService::class));

        $this->assertSame(Issue::SEVERITY_CRITICAL, $this->invoke($service, 'severityToEnum', 0.8));
        $this->assertSame(Issue::SEVERITY_HIGH, $this->invoke($service, 'severityToEnum', 0.6));
        $this->assertSame(Issue::SEVERITY_MEDIUM, $this->invoke($service, 'severityToEnum', 0.4));
        $this->assertSame(Issue::SEVERITY_LOW, $this->invoke($service, 'severityToEnum', 0.2));
        $this->assertSame(Issue::SEVERITY_MEDIUM, $this->invoke($service, 'severityToEnum', null));
    }
}
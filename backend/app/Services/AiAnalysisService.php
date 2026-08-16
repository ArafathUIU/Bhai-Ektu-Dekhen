<?php

namespace App\Services;

use App\Models\AiAnalysis;
use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\IssueMatch;
use App\Models\Notification;
use App\Models\Report;
use Illuminate\Support\Facades\Http;

class AiAnalysisService
{
    public function __construct(private readonly IssueService $issues)
    {
    }

    /**
     * Dispatch a report for AI analysis. In production this is queued via
     * the AnalyzeReportJob; here we call the worker over HTTP.
     */
    public function analyze(Report $report): AiAnalysis
    {
        $analysis = AiAnalysis::create([
            'report_id' => $report->id,
            'status' => AiAnalysis::STATUS_PENDING,
        ]);

        $imageUrl = $this->imageUrl($report);

        if (! $imageUrl) {
            $analysis->update(['status' => AiAnalysis::STATUS_FAILED]);

            return $analysis;
        }

        try {
            $response = Http::baseUrl(config('services.ai_worker.base_url'))
                ->timeout((int) config('services.ai_worker.timeout', 30))
                ->post('/analyze', [
                    'report_id' => $report->id,
                    'public_id' => $report->public_id,
                    'image_url' => $imageUrl,
                    'latitude' => $report->latitude,
                    'longitude' => $report->longitude,
                    'description' => $report->description,
                ]);

            $response->throw();
            $payload = $response->json();
        } catch (\Throwable $e) {
            $analysis->update([
                'status' => AiAnalysis::STATUS_FAILED,
                'metadata' => ['error' => $e->getMessage()],
            ]);

            return $analysis;
        }

        $category = IssueCategory::where('slug', $payload['classification']['category_slug'] ?? '')
            ->first();

        $analysis->update([
            'model_name' => $payload['model_name'] ?? null,
            'model_version' => $payload['model_version'] ?? null,
            'predicted_category_id' => $category?->id,
            'predicted_category_slug' => $payload['classification']['category_slug'] ?? null,
            'confidence' => $payload['classification']['confidence'] ?? null,
            'severity_score' => $payload['severity_score'] ?? null,
            'embedding' => $payload['embedding'] ?? null,
            'embedding_dim' => $payload['embedding_dim'] ?? null,
            'processing_time_ms' => $payload['processing_time_ms'] ?? null,
            'status' => AiAnalysis::STATUS_COMPLETED,
            'metadata' => $payload['classification']['scores'] ?? null,
        ]);

        return $analysis->refresh();
    }

    /**
     * Run duplicate detection for a completed analysis and either attach the
     * report to an existing issue or create a fresh issue from it.
     */
    public function resolveIssueLinkage(Report $report, AiAnalysis $analysis): void
    {
        $candidate = $this->findBestMatch($report, $analysis);

        if ($candidate && $candidate['overall'] >= 0.70) {
            $issue = $candidate['issue'];
            $report->update(['issue_id' => $issue->id, 'status' => Report::STATUS_REPORTED]);
            $issue->update(['last_reported_at' => now()]);
            $this->recordMatch($report, $issue, $candidate, IssueMatch::DECISION_MERGED);

            app(NotificationService::class)->notifyReportAuthor(
                $report,
                Notification::TYPE_POSSIBLE_DUPLICATE,
                'Possible duplicate detected',
                "Your report was merged with issue {$issue->public_id} nearby.",
                ['issue_id' => $issue->id, 'issue_public_id' => $issue->public_id],
            );

            return;
        }

        $issue = $this->issues->createIssueFromReport(
            $report,
            $this->severityToEnum($analysis->severity_score),
        );
        $this->recordMatch($report, $issue, null, IssueMatch::DECISION_REJECTED);
    }

    /**
     * Find the strongest candidate issue within the geo radius using
     * geospatial proximity first, then image/text similarity.
     *
     * @return array{issue: Issue, geo: float, image: float, text: float, overall: float}|null
     */
    public function findBestMatch(Report $report, AiAnalysis $analysis): ?array
    {
        if (! $report->latitude || ! $report->longitude) {
            return null;
        }

        $radius = (float) config('ai.duplicate_geo_radius_m', 300);

        $candidates = Issue::query()
            ->whereNotNull('location')
            ->whereNotIn('status', [Issue::STATUS_CLOSED, Issue::STATUS_REJECTED])
            ->selectRaw(
                'issues.*, ST_Distance(issues.location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) AS distance_meters',
                [$report->longitude, $report->latitude],
            )
            ->whereRaw(
                'ST_DWithin(issues.location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
                [$report->longitude, $report->latitude, $radius],
            )
            ->orderBy('distance_meters')
            ->limit(20)
            ->get();

        if ($candidates->isEmpty()) {
            return null;
        }

        $embedding = $analysis->embedding;
        $best = null;

        foreach ($candidates as $candidate) {
            $geo = (float) $candidate->distance_meters;
            $image = $this->bestImageSimilarity($candidate, $embedding);
            $text = $this->textSimilarity($report->description, $candidate->description);
            $overall = $this->combineSimilarities($geo, $image, $text, $radius);

            if ($best === null || $overall > $best['overall']) {
                $best = [
                    'issue' => $candidate,
                    'geo' => $geo,
                    'image' => $image,
                    'text' => $text,
                    'overall' => $overall,
                ];
            }
        }

        return $best;
    }

    private function imageUrl(Report $report): ?string
    {
        $media = $report->media()->first();

        return $media?->url ? url('/storage/'.$media->url) : null;
    }

    /**
     * Compare the new report embedding against the most similar report
     * already attached to the candidate issue.
     */
    private function bestImageSimilarity(Issue $issue, ?array $embedding): float
    {
        if (! $embedding) {
            return 0.0;
        }

        $best = 0.0;
        foreach ($issue->reports()->with('analyses')->get() as $existing) {
            $existingAnalysis = $existing->analyses()->latest()->first();
            if (! $existingAnalysis?->embedding) {
                continue;
            }
            $best = max($best, $this->cosine($embedding, $existingAnalysis->embedding));
        }

        return $best;
    }

    private function textSimilarity(?string $a, ?string $b): float
    {
        if (! $a || ! $b) {
            return 0.0;
        }

        $a = strtolower(trim($a));
        $b = strtolower(trim($b));

        if ($a === $b) {
            return 1.0;
        }

        similar_text($a, $b, $percent);

        return round($percent / 100, 4);
    }

    private function combineSimilarities(float $geo, float $image, float $text, float $radius): float
    {
        // Closer is better: 0 m → 1.0, radius m → 0.0
        $geoScore = max(0.0, 1.0 - ($geo / $radius));

        // Weighted blend; image + text are most discriminative.
        return round(($geoScore * 0.2) + ($image * 0.5) + ($text * 0.3), 4);
    }

    private function cosine(array $a, array $b): float
    {
        if (! $a || ! $b || count($a) !== count($b)) {
            return 0.0;
        }

        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;
        foreach ($a as $i => $value) {
            $other = $b[$i] ?? 0.0;
            $dot += $value * $other;
            $normA += $value * $value;
            $normB += $other * $other;
        }

        if ($normA === 0.0 || $normB === 0.0) {
            return 0.0;
        }

        return round($dot / (sqrt($normA) * sqrt($normB)), 4);
    }

    private function recordMatch(Report $report, Issue $issue, ?array $scores, string $decision): void
    {
        IssueMatch::create([
            'report_id' => $report->id,
            'issue_id' => $issue->id,
            'geo_distance_meters' => $scores['geo'] ?? null,
            'image_similarity' => $scores['image'] ?? null,
            'text_similarity' => $scores['text'] ?? null,
            'overall_similarity' => $scores['overall'] ?? null,
            'decision' => $decision,
        ]);
    }

    private function severityToEnum(?float $score): string
    {
        if ($score === null) {
            return Issue::SEVERITY_MEDIUM;
        }

        return match (true) {
            $score >= 0.8 => Issue::SEVERITY_CRITICAL,
            $score >= 0.6 => Issue::SEVERITY_HIGH,
            $score >= 0.4 => Issue::SEVERITY_MEDIUM,
            default => Issue::SEVERITY_LOW,
        };
    }
}

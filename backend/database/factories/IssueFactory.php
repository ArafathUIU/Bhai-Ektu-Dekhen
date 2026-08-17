<?php

namespace Database\Factories;

use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class IssueFactory extends Factory
{
    protected $model = Issue::class;

    public function definition(): array
    {
        return [
            'category_id' => IssueCategory::factory(),
            'title' => Str::of($this->faker->sentence(4))->title(),
            'description' => $this->faker->paragraph(),
            'latitude' => $this->faker->latitude(23.7, 23.9),
            'longitude' => $this->faker->longitude(90.35, 90.45),
            'severity' => Issue::SEVERITY_MEDIUM,
            'status' => Issue::STATUS_VERIFIED,
            'confidence_score' => null,
            'first_reported_at' => now(),
            'last_reported_at' => now(),
            'resolved_at' => null,
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (Issue $issue) {
            if (empty($issue->public_id)) {
                $issue->public_id = 'BEK-' . strtoupper(Str::random(6));
            }
        });
    }
}

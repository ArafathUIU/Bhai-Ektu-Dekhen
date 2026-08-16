<?php

namespace Database\Factories;

use App\Models\IssueCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<IssueCategory>
 */
class IssueCategoryFactory extends Factory
{
    protected $model = IssueCategory::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'slug' => fake()->unique()->slug(2),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
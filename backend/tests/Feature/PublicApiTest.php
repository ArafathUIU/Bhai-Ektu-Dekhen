<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_summary_returns_counts_without_auth(): void
    {
        $category = IssueCategory::factory()->create();
        IssueCategory::factory()->count(3)->create();
        User::factory()->count(3)->create();

        Issue::factory()->count(5)->create(['status' => 'VERIFIED', 'category_id' => $category->id]);
        Issue::factory()->count(2)->create(['status' => 'RESOLVED', 'category_id' => $category->id]);

        $response = $this->getJson('/api/v1/summary');

        $response->assertOk()
            ->assertJsonPath('data.total_issues', 7)
            ->assertJsonPath('data.open_issues', 5)
            ->assertJsonPath('data.resolved_issues', 2)
            ->assertJsonPath('data.categories', 4)
            ->assertJsonPath('data.citizens', 3);
    }
}

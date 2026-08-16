<?php

namespace Database\Seeders;

use App\Models\IssueCategory;
use Illuminate\Database\Seeder;

class IssueCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Road Damage', 'slug' => 'road_damage', 'description' => 'Potholes, cracked roads, broken pavement'],
            ['name' => 'Drainage', 'slug' => 'drainage', 'description' => 'Blocked drains, overflow, open/damaged drains'],
            ['name' => 'Street Light', 'slug' => 'street_light', 'description' => 'Broken lights, missing lights, damaged poles'],
            ['name' => 'Garbage', 'slug' => 'garbage', 'description' => 'Illegal dumping, overflowing garbage, uncollected waste'],
        ];

        foreach ($categories as $category) {
            IssueCategory::firstOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}

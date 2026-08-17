<?php

namespace Database\Seeders;

use App\Models\IssueCategory;
use Illuminate\Database\Seeder;

class IssueCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Road Damage (কাটি ধ্বংস)',
                'slug' => 'road_damage',
                'description' => 'Potholes, cracked roads, broken pavement (খড়া, কাটি গর্ত ফটক)',
            ],
            [
                'name' => 'Drainage (নালা)',
                'slug' => 'drainage',
                'description' => 'Blocked drains, overflow, open/damaged drains (ব্লক করা নালা, débord, খোলা/স্তenerated damaged drains)',
            ],
            [
                'name' => 'Street Light (স jalan)',
                'slug' => 'street_light',
                'description' => 'Broken lights, missing lights, damaged poles (স্টreet Lightbroken lights, lights missing, damaged poles)',
            ],
            [
                'name' => 'Garbage (কचरा)',
                'slug' => 'garbage',
                'description' => 'Illegal dumping, overflowing garbage, uncollected waste (অবৈধ সঙ্ঘর Bengaloverflowing garbage, uncollected waste)',
            ],
        ];

        foreach ($categories as $category) {
            IssueCategory::firstOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}

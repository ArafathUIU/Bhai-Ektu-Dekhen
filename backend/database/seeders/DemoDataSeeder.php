<?php

namespace Database\Seeders;

use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (Issue::count() > 0) {
            $this->command?->warn('Issues already exist; skipping demo seed.');

            return;
        }

        $citizen = User::where('email', 'citizen@bek.local')->first()
            ?? User::create([
                'name' => 'Demo Citizen',
                'email' => 'citizen@bek.local',
                'password' => 'secret123',
                'role_id' => \App\Models\Role::where('slug', 'user')->first()->id,
                'status' => 'active',
            ]);

        $categories = IssueCategory::all();

        // Dhaka-area sample issues across the four categories.
        $samples = [
            ['slug' => 'road_damage', 'lat' => 23.780, 'lng' => 90.390, 'severity' => 'HIGH', 'desc' => 'Deep potholes on the main road near the market'],
            ['slug' => 'road_damage', 'lat' => 23.790, 'lng' => 90.405, 'severity' => 'CRITICAL', 'desc' => 'Road surface collapsed, large crater'],
            ['slug' => 'drainage', 'lat' => 23.772, 'lng' => 90.385, 'severity' => 'HIGH', 'desc' => 'Drain blocked, water overflowing onto street'],
            ['slug' => 'drainage', 'lat' => 23.795, 'lng' => 90.412, 'severity' => 'MEDIUM', 'desc' => 'Open drain with broken cover plates'],
            ['slug' => 'street_light', 'lat' => 23.785, 'lng' => 90.398, 'severity' => 'MEDIUM', 'desc' => 'Street lights not working on the block'],
            ['slug' => 'garbage', 'lat' => 23.775, 'lng' => 90.395, 'severity' => 'HIGH', 'desc' => 'Illegal garbage dumping behind the school'],
        ];

        foreach ($samples as $i => $sample) {
            $category = $categories->firstWhere('slug', $sample['slug']);

            $report = Report::create([
                'user_id' => $citizen->id,
                'category_id' => $category->id,
                'description' => $sample['desc'],
                'latitude' => $sample['lat'],
                'longitude' => $sample['lng'],
                'status' => Report::STATUS_REPORTED,
            ]);
            $report->public_id = 'BEK-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);
            $report->save();

            DB::statement(
                'UPDATE reports SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
                [$sample['lng'], $sample['lat'], $report->id],
            );

            $issue = app(\App\Services\IssueService::class)->createIssueFromReport($report, $sample['severity']);
            $issue->update([
                'severity' => $sample['severity'],
                'status' => match ($i % 3) {
                    0 => Issue::STATUS_VERIFIED,
                    1 => Issue::STATUS_ASSIGNED,
                    default => Issue::STATUS_REPORTED,
                },
            ]);
        }

        $this->command?->info('Demo data seeded: '.count($samples).' sample issues.');
    }
}
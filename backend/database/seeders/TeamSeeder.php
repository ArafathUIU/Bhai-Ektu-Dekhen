<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $teams = [
            ['name' => 'Road Maintenance', 'department' => 'Public Works', 'area' => 'Mymensingh Zone 3'],
            ['name' => 'Drainage Unit', 'department' => 'City Corporation', 'area' => 'Mymensingh City'],
            ['name' => 'Street Light Crew', 'department' => 'Electricity', 'area' => 'Mymensingh Zone 3'],
            ['name' => 'Waste Management', 'department' => 'City Corporation', 'area' => 'Mymensingh City'],
        ];

        foreach ($teams as $team) {
            Team::firstOrCreate(['name' => $team['name']], $team);
        }
    }
}

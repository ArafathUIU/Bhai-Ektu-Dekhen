<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role_id' => \App\Models\Role::where('slug', \App\Models\Role::USER)->value('id'),
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@bek.local',
            'role_id' => \App\Models\Role::where('slug', \App\Models\Role::ADMIN)->value('id'),
        ]);
    }
}

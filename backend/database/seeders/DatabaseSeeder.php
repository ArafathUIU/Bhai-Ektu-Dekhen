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
        $this->call(IssueCategorySeeder::class);
        $this->call(TeamSeeder::class);

        \App\Models\User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'role_id' => \App\Models\Role::where('slug', \App\Models\Role::USER)->value('id'),
            ],
        );

        \App\Models\User::firstOrCreate(
            ['email' => 'admin@bek.local'],
            [
                'name' => 'Admin User',
                'password' => 'password',
                'role_id' => \App\Models\Role::where('slug', \App\Models\Role::ADMIN)->value('id'),
            ],
        );
    }
}

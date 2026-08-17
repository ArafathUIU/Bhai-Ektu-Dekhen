<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\Media;
use App\Models\Report;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New Citizen',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.email', 'new@example.com')
            ->assertJsonStructure(['data' => ['user', 'token']]);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_user_can_login_and_logout(): void
    {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $login->assertOk()->assertJsonStructure(['data' => ['token']]);

        $token = $login->json('data.token');

        $this->postJson('/api/v1/auth/logout', [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();

        // Guards are cached per-process in tests; forget so the next request
        // re-resolves the (now deleted) token like a fresh HTTP request would.
        Auth::forgetGuards();

        $this->getJson('/api/v1/auth/profile', ['Authorization' => "Bearer {$token}"])
            ->assertStatus(401);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertStatus(401);
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/profile')->assertStatus(401);
    }

    public function test_profile_returns_user_stats(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        \App\Models\Report::factory()->count(2)->create(['user_id' => $user->id]);

        $this->getJson('/api/v1/auth/profile', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.stats.reports_submitted', 2);
    }
}
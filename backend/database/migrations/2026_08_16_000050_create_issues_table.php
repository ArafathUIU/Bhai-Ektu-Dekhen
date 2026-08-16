<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();
            $table->foreignId('category_id')->constrained('issue_categories')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('severity')->default('MEDIUM');
            $table->string('status')->default('REPORTED');
            $table->decimal('confidence_score', 5, 4)->nullable();
            $table->timestamp('first_reported_at')->nullable();
            $table->timestamp('last_reported_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('category_id');
            $table->index('status');
            $table->index('severity');
            $table->index('created_at');
        });

        DB::statement('ALTER TABLE issues ADD COLUMN location geography(POINT, 4326)');
        DB::statement('CREATE INDEX issues_location_gist ON issues USING GIST(location)');

        Schema::create('issue_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('issue_supports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['issue_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issue_supports');
        Schema::dropIfExists('issue_status_history');
        Schema::dropIfExists('issues');
    }
};

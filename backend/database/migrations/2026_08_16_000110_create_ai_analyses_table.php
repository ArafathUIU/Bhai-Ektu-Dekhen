<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('model_name')->nullable();
            $table->string('model_version')->nullable();
            $table->foreignId('predicted_category_id')->nullable()->constrained('issue_categories')->nullOnDelete();
            $table->string('predicted_category_slug')->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->decimal('severity_score', 5, 4)->nullable();
            $table->json('embedding')->nullable();
            $table->unsignedInteger('embedding_dim')->nullable();
            $table->unsignedInteger('processing_time_ms')->nullable();
            $table->string('status')->default('PENDING');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('report_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_analyses');
    }
};

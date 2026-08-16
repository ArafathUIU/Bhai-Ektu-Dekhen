<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issue_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->foreignId('issue_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('geo_distance_meters', 10, 2)->nullable();
            $table->decimal('image_similarity', 5, 4)->nullable();
            $table->decimal('text_similarity', 5, 4)->nullable();
            $table->decimal('overall_similarity', 5, 4)->nullable();
            $table->string('decision')->default('PENDING');
            $table->timestamps();

            $table->index('report_id');
            $table->index('decision');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issue_matches');
    }
};

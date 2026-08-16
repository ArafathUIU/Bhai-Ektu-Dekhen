<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable(['user_id', 'issue_id', 'category_id', 'description', 'latitude', 'longitude', 'status'])]
class Report extends Model
{
    use HasFactory;

    public const STATUS_PROCESSING = 'PROCESSING';

    public const STATUS_REPORTED = 'REPORTED';

    public const STATUS_REJECTED = 'REJECTED';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(IssueCategory::class, 'category_id');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(AiAnalysis::class);
    }
}

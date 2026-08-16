<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'report_id',
    'model_name',
    'model_version',
    'predicted_category_id',
    'predicted_category_slug',
    'confidence',
    'severity_score',
    'embedding',
    'embedding_dim',
    'processing_time_ms',
    'status',
    'metadata',
])]
class AiAnalysis extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'PENDING';

    public const STATUS_COMPLETED = 'COMPLETED';

    public const STATUS_FAILED = 'FAILED';

    protected function casts(): array
    {
        return [
            'embedding' => 'array',
            'metadata' => 'array',
        ];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function predictedCategory(): HasOne
    {
        return $this->hasOne(IssueCategory::class, 'id', 'predicted_category_id');
    }
}

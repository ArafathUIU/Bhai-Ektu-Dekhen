<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'report_id',
    'issue_id',
    'geo_distance_meters',
    'image_similarity',
    'text_similarity',
    'overall_similarity',
    'decision',
])]
class IssueMatch extends Model
{
    use HasFactory;

    public const DECISION_PENDING = 'PENDING';

    public const DECISION_MERGED = 'MERGED';

    public const DECISION_REJECTED = 'REJECTED';

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }
}

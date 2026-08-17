<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'category_id', 'title', 'description', 'latitude', 'longitude', 'severity', 'status', 'confidence_score', 'first_reported_at', 'last_reported_at', 'resolved_at'])]
class Issue extends Model
{
    use HasFactory;

    public const SEVERITY_LOW = 'LOW';

    public const SEVERITY_MEDIUM = 'MEDIUM';

    public const SEVERITY_HIGH = 'HIGH';

    public const SEVERITY_CRITICAL = 'CRITICAL';

    public const STATUS_REPORTED = 'REPORTED';

    public const STATUS_UNDER_REVIEW = 'UNDER_REVIEW';

    public const STATUS_VERIFIED = 'VERIFIED';

    public const STATUS_ASSIGNED = 'ASSIGNED';

    public const STATUS_IN_PROGRESS = 'IN_PROGRESS';

    public const STATUS_RESOLVED = 'RESOLVED';

    public const STATUS_CLOSED = 'CLOSED';

    public const STATUS_REOPENED = 'REOPENED';

    public const STATUS_REJECTED = 'REJECTED';

    protected function casts(): array
    {
        return [
            'first_reported_at' => 'datetime',
            'last_reported_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(IssueCategory::class, 'category_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(IssueStatusHistory::class);
    }

    public function supports(): HasMany
    {
        return $this->hasMany(IssueSupport::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'mediable_id')->where('mediable_type', self::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function aiAnalyses(): HasMany
    {
        return $this->hasMany(AiAnalysis::class);
    }
}

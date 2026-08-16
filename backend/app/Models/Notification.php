<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'type', 'title', 'message', 'data', 'read_at'])]
class Notification extends Model
{
    use HasFactory;

    public const TYPE_REPORT_VERIFIED = 'REPORT_VERIFIED';

    public const TYPE_REPORT_REJECTED = 'REPORT_REJECTED';

    public const TYPE_ISSUE_ASSIGNED = 'ISSUE_ASSIGNED';

    public const TYPE_ISSUE_RESOLVED = 'ISSUE_RESOLVED';

    public const TYPE_ISSUE_REOPENED = 'ISSUE_REOPENED';

    public const TYPE_POSSIBLE_DUPLICATE = 'POSSIBLE_DUPLICATE';

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function markAsRead(): void
    {
        if ($this->read_at === null) {
            $this->update(['read_at' => now()]);
        }
    }
}
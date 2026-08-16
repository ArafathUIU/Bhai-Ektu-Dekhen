<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['issue_id', 'from_status', 'to_status', 'changed_by', 'reason'])]
class IssueStatusHistory extends Model
{
    use HasFactory;

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}

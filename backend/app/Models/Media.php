<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['user_id', 'mediable_type', 'mediable_id', 'type', 'storage_key', 'url', 'mime_type', 'size', 'metadata'])]
class Media extends Model
{
    use HasFactory;

    public const TYPE_REPORT_PHOTO = 'REPORT_PHOTO';

    public const TYPE_RESOLUTION_BEFORE = 'RESOLUTION_BEFORE';

    public const TYPE_RESOLUTION_AFTER = 'RESOLUTION_AFTER';

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

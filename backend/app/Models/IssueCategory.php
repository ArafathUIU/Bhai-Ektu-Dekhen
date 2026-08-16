<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'is_active'])]
class IssueCategory extends Model
{
    use HasFactory;

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function issues(): HasMany
    {
        return $this->hasMany(Issue::class, 'category_id');
    }
}

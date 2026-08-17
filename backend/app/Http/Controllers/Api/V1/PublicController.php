<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueCategory;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    public function summary(): JsonResponse
    {
        $total = Issue::count();
        $open = Issue::whereNotIn('status', ['RESOLVED', 'CLOSED', 'REJECTED'])->count();
        $resolved = Issue::where('status', 'RESOLVED')->count();
        $categories = IssueCategory::count();
        $citizens = User::count();

        return response()->json([
            'data' => [
                'total_issues' => $total,
                'open_issues' => $open,
                'resolved_issues' => $resolved,
                'categories' => $categories,
                'citizens' => $citizens,
            ],
        ]);
    }
}

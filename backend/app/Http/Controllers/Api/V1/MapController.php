<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MapController extends Controller
{
    public function nearby(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['nullable', 'integer', 'min:50', 'max:5000'],
            'status' => ['nullable', 'string'],
        ]);

        $radius = $validated['radius'] ?? 500;

        $query = Issue::query()
            ->select('issues.*')
            ->selectRaw(
                'ST_Distance(
                    issues.location,
                    ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
                ) AS distance_meters',
                [$validated['longitude'], $validated['latitude']],
            )
            ->whereRaw(
                'ST_DWithin(
                    issues.location,
                    ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
                    ?
                )',
                [$validated['longitude'], $validated['latitude'], $radius],
            )
            ->whereNotIn('issues.status', [Issue::STATUS_CLOSED, Issue::STATUS_REJECTED]);

        if ($request->filled('status')) {
            $query->where('issues.status', $validated['status']);
        }

        $issues = $query->with('category')->orderBy('distance_meters')->limit(50)->get();

        return response()->json([
            'data' => [
                'issues' => $issues,
            ],
        ]);
    }

    public function heatmap(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bbox' => ['required', 'string', 'regex:/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/'],
            'cell_size' => ['nullable', 'numeric', 'min:0.0001', 'max:0.1'],
        ]);

        [$minLng, $minLat, $maxLng, $maxLat] = array_map('floatval', explode(',', $validated['bbox']));
        $cellSize = $validated['cell_size'] ?? 0.01;

        $cells = DB::select(
            <<<'SQL'
                SELECT
                    (FLOOR(longitude / ?::float8) * ?::float8) AS lng,
                    (FLOOR(latitude / ?::float8) * ?::float8) AS lat,
                    COUNT(*) AS count
                FROM issues
                WHERE latitude IS NOT NULL
                  AND longitude IS NOT NULL
                  AND longitude BETWEEN ? AND ?
                  AND latitude BETWEEN ? AND ?
                GROUP BY lng, lat
                ORDER BY count DESC
                SQL,
            [$cellSize, $cellSize, $cellSize, $cellSize, $minLng, $maxLng, $minLat, $maxLat],
        );

        return response()->json([
            'data' => ['cells' => $cells],
        ]);
    }
}

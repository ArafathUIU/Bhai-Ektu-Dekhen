<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\Media;
use App\Models\Report;
use App\Services\PublicIdGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function __construct(private readonly PublicIdGenerator $ids)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['nullable', 'exists:issue_categories,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ]);

        $user = $request->user();

        $report = DB::transaction(function () use ($user, $validated) {
            $report = new Report([
                'user_id' => $user->id,
                'category_id' => $validated['category_id'] ?? null,
                'description' => $validated['description'] ?? null,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'status' => Report::STATUS_PROCESSING,
            ]);
            $report->save();

            $report->public_id = $this->ids->reportId($report->id);
            $report->save();

            DB::statement(
                'UPDATE reports SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
                [$validated['longitude'], $validated['latitude'], $report->id],
            );

            return $report;
        });

        $path = $request->file('photo')->store('reports/'.now()->format('Y/m'), 'public');

        Media::create([
            'user_id' => $user->id,
            'mediable_type' => Report::class,
            'mediable_id' => $report->id,
            'type' => Media::TYPE_REPORT_PHOTO,
            'storage_key' => $path,
            'url' => $path,
            'mime_type' => $request->file('photo')->getMimeType(),
            'size' => $request->file('photo')->getSize(),
        ]);

        return response()->json([
            'data' => [
                'report' => $report->load(['media', 'category']),
            ],
            'message' => 'Report submitted. Status is PROCESSING.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $reports = $request->user()->reports()->with(['media', 'category'])->latest()->paginate(15);

        return response()->json([
            'data' => ['reports' => $reports],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $report = Report::where('public_id', $publicId)
            ->with(['media', 'category', 'issue', 'user'])
            ->firstOrFail();

        return response()->json([
            'data' => ['report' => $report],
        ]);
    }
}

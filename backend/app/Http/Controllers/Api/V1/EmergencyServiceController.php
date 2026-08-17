<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\EmergencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmergencyServiceController extends Controller
{
    public function __construct(private readonly EmergencyService $emergency)
    {
    }

    public function nearby(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'sometimes|integer|between:500,20000',
        ]);

        $result = $this->emergency->nearby(
            (float) $data['lat'],
            (float) $data['lng'],
            (int) ($data['radius'] ?? 10000),
        );

        return response()->json(['data' => $result]);
    }
}
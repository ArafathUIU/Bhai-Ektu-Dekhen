<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\IssueController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::get('/issues', [IssueController::class, 'index']);
    Route::get('/issues/{publicId}', [IssueController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/profile', [AuthController::class, 'profile']);

        Route::get('/users', [UserController::class, 'index'])
            ->middleware('role:admin');

        Route::get('/reports', [ReportController::class, 'index']);
        Route::post('/reports', [ReportController::class, 'store']);
        Route::get('/reports/{publicId}', [ReportController::class, 'show']);

        Route::post('/issues/{publicId}/support', [IssueController::class, 'support']);

        Route::middleware('role:admin,moderator')->group(function () {
            Route::post('/reports/{report}/create-issue', [IssueController::class, 'createFromReport']);
            Route::patch('/issues/{publicId}/status', [IssueController::class, 'updateStatus']);
            Route::patch('/issues/{publicId}/severity', [IssueController::class, 'updateSeverity']);
        });
    });
});

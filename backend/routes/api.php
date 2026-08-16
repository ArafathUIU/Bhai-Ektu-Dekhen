<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\IssueController;
use App\Http\Controllers\Api\V1\MapController;
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

    Route::get('/map/nearby', [MapController::class, 'nearby']);
    Route::get('/map/heatmap', [MapController::class, 'heatmap']);

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

        Route::middleware('role:admin')->group(function () {
            Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/admin/teams', [AdminController::class, 'teams']);
            Route::post('/admin/teams', [AdminController::class, 'storeTeam']);
            Route::post('/admin/issues/{publicId}/assign', [AdminController::class, 'assign']);
            Route::get('/admin/assignments', [AdminController::class, 'assignments']);
            Route::patch('/admin/assignments/{assignment}/status', [AdminController::class, 'updateAssignmentStatus']);
        });
    });
});

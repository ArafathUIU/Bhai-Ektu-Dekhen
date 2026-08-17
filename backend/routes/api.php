<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\IntelligenceController;
use App\Http\Controllers\Api\V1\IssueController;
use App\Http\Controllers\Api\V1\MapController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::get('/issues', [IssueController::class, 'index'])->middleware('throttle:api');
    Route::get('/issues/{publicId}', [IssueController::class, 'show'])->middleware('throttle:api');
    Route::get('/categories', [IssueController::class, 'categories'])->middleware('throttle:api');

    Route::get('/map/nearby', [MapController::class, 'nearby'])->middleware('throttle:api');
    Route::get('/map/heatmap', [MapController::class, 'heatmap'])->middleware('throttle:api');

    Route::get('/intelligence/hotspots', [IntelligenceController::class, 'hotspots'])->middleware('throttle:api');
    Route::get('/intelligence/analytics', [IntelligenceController::class, 'analytics'])->middleware('throttle:api');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/profile', [AuthController::class, 'profile']);

        Route::get('/users', [UserController::class, 'index'])
            ->middleware('role:admin');

        Route::get('/reports', [ReportController::class, 'index']);
        Route::post('/reports', [ReportController::class, 'store'])
            ->middleware('throttle:reports');
        Route::get('/reports/{publicId}', [ReportController::class, 'show']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

        Route::post('/issues/{publicId}/support', [IssueController::class, 'support']);

        Route::middleware('role:admin,moderator')->group(function () {
            Route::post('/reports/{publicId}/verify', [ReportController::class, 'verify']);
            Route::post('/reports/{publicId}/reject', [ReportController::class, 'reject']);
            Route::post('/reports/{report}/create-issue', [IssueController::class, 'createFromReport']);
            Route::patch('/issues/{publicId}/status', [IssueController::class, 'updateStatus']);
            Route::patch('/issues/{publicId}/severity', [IssueController::class, 'updateSeverity']);
        });

        Route::middleware('role:admin')->group(function () {
            Route::get('/intelligence/priorities', [IntelligenceController::class, 'priorities']);
            Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/admin/moderation', [AdminController::class, 'moderationQueue']);
            Route::get('/admin/teams', [AdminController::class, 'teams']);
            Route::post('/admin/teams', [AdminController::class, 'storeTeam']);
            Route::post('/admin/issues/{publicId}/assign', [AdminController::class, 'assign']);
            Route::get('/admin/assignments', [AdminController::class, 'assignments']);
            Route::patch('/admin/assignments/{assignment}/status', [AdminController::class, 'updateAssignmentStatus']);
        });
    });
});

<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configureSlowQueryLogging();
    }

    private function configureSlowQueryLogging(): void
    {
        $thresholdMs = (int) config('logging.slow_query_threshold_ms', 500);

        DB::listen(function (QueryExecuted $query) use ($thresholdMs) {
            if ($query->time >= $thresholdMs) {
                Log::warning('Slow query', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time_ms' => $query->time,
                    'connection' => $query->connectionName,
                ]);
            }
        });
    }

    private function configureRateLimiting(): void
    {
        // Stricter limit for authentication endpoints to slow brute force.
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(10)->by(
            $request->ip().'|'.$request->userAgent(),
        ));

        // Public read endpoints.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by(
            $request->user()?->id ?: $request->ip(),
        ));

        // Report submissions (multipart, heavier) — 20/min.
        RateLimiter::for('reports', fn (Request $request) => Limit::perMinute(20)->by(
            $request->user()?->id ?: $request->ip(),
        ));
    }
}

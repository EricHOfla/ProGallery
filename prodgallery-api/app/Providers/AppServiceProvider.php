<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use App\Models\Cart;
use App\Models\Order;
use App\Policies\CartPolicy;
use App\Policies\OrderPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Cart::class => CartPolicy::class,
        Order::class => OrderPolicy::class,
    ];

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
        // Reset links should return customers to the frontend SPA, not the Laravel host.
        ResetPassword::createUrlUsing(function ($user, string $token): string {
            $frontendUrl = rtrim((string) env('FRONTEND_URL', config('app.url')), '/');

            return $frontendUrl . '/reset-password?token=' . urlencode($token)
                . '&email=' . urlencode($user->getEmailForPasswordReset());
        });

        // Register policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        $shouldLog = filter_var(env('LOG_SLOW_QUERIES', false), FILTER_VALIDATE_BOOL);
        $thresholdMs = (int) env('SLOW_QUERY_MS', 200);

        if ($shouldLog) {
            DB::listen(function ($query) use ($thresholdMs) {
                if ($query->time >= $thresholdMs) {
                    Log::warning('Slow query detected', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings,
                        'time_ms' => $query->time,
                    ]);
                }
            });
        }
    }
}

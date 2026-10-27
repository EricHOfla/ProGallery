<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Photo;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return $this->stats();
    }

    public function stats()
    {
        $totalPhotos = Photo::count();
        $totalOrders = Order::count();
        // Revenue reflects completed payments only, not unpaid order attempts.
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $pendingPayments = Order::where('payment_status', '!=', 'paid')->count();
        $totalUsers = User::where('role', 'customer')->count();

        $recentOrders = Order::query()
            ->select([
                'id',
                'user_id',
                'order_number',
                'total_amount',
                'status',
                'payment_status',
                'payment_method',
                'created_at',
            ])
            ->with(['user:id,name,email'])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        return response()->json([
            'total_photos' => $totalPhotos,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'pending_orders' => $pendingOrders,
            'pending_payments' => $pendingPayments,
            'total_users' => $totalUsers,
            'recent_orders' => $recentOrders,
        ]);
    }
}

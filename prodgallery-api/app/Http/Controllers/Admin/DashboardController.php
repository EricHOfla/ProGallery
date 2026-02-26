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
        $totalRevenue = Order::sum('total_amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $totalUsers = User::where('role', 'customer')->count();

        $recentOrders = Order::query()
            ->select(['id', 'user_id', 'order_number', 'total_amount', 'status', 'created_at'])
            ->with(['user:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'total_photos' => $totalPhotos,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'pending_orders' => $pendingOrders,
            'total_users' => $totalUsers,
            'recent_orders' => $recentOrders,
        ]);
    }
}

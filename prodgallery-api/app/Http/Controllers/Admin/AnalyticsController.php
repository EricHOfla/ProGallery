<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Photo;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function revenue()
    {
        try {
            $revenueByMonth = Order::where('status', 'completed')
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total_amount) as revenue')
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get();

            return response()->json($revenueByMonth);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function topSellingPhotos()
    {
        try {
            $topPhotos = OrderItem::select('photos.id', 'photos.title', 'photos.image', DB::raw('SUM(order_items.quantity) as total_sold'), DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue'))
                ->join('photos', 'order_items.photo_id', '=', 'photos.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'completed')
                ->groupBy('photos.id', 'photos.title', 'photos.image')
                ->orderBy('total_sold', 'desc')
                ->limit(10)
                ->get();

            return response()->json($topPhotos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function orderStatusBreakdown()
    {
        try {
            $breakdown = Order::selectRaw('status, COUNT(*) as count, SUM(total_amount) as total_amount')
                ->groupBy('status')
                ->get();

            return response()->json($breakdown);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function salesByCategory()
    {
        try {
            $categoryStats = OrderItem::select('categories.name', DB::raw('SUM(order_items.quantity) as total_sold'), DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue'))
                ->join('photos', 'order_items.photo_id', '=', 'photos.id')
                ->join('categories', 'photos.category_id', '=', 'categories.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'completed')
                ->groupBy('categories.id', 'categories.name')
                ->orderBy('total_revenue', 'desc')
                ->get();

            return response()->json($categoryStats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

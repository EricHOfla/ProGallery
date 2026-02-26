<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('user', 'items.photo')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('user', 'items.photo')
            ->findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order->update(['status' => $request->status]);
        return response()->json($order);
    }
}

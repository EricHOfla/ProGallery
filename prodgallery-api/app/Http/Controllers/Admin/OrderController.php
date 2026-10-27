<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        $order = Order::with('user', 'items.photo')->findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        if ($validated['status'] === 'completed' && $order->payment_status !== 'paid') {
            return response()->json(['message' => 'An order cannot be completed before payment is confirmed.'], 422);
        }

        if ($order->payment_status === 'refunded' && $validated['status'] !== 'cancelled') {
            return response()->json(['message' => 'A refunded order cannot be reopened.'], 422);
        }

        $order->update(['status' => $validated['status']]);
        return response()->json($order->fresh());
    }

    public function refund(Request $request, $id)
    {
        $order = Order::with('user')->findOrFail($id);

        if ($order->payment_status === 'refunded' || $order->stripe_refund_id) {
            return response()->json(['message' => 'This order has already been refunded.'], 409);
        }

        if ($order->payment_status !== 'paid' || !$order->payment_intent_id) {
            return response()->json(['message' => 'Only paid orders with a confirmed Stripe payment can be refunded here.'], 422);
        }

        $secret = (string) config('services.stripe.secret');
        if ($secret === '') {
            return response()->json(['message' => 'Stripe is not configured. No refund was submitted.'], 503);
        }

        $validated = $request->validate([
            'reason' => 'nullable|in:duplicate,fraudulent,requested_by_customer',
        ]);

        try {
            $stripeRequest = Http::withToken($secret)
                ->withHeaders(['Idempotency-Key' => 'progallery-refund-order-' . $order->id])
                ->asForm()
                ->timeout(20);

            $payload = ['payment_intent' => $order->payment_intent_id];
            if (!empty($validated['reason'])) {
                $payload['reason'] = $validated['reason'];
            }

            $response = $stripeRequest->post('https://api.stripe.com/v1/refunds', $payload);
        } catch (\Throwable $exception) {
            Log::warning('Stripe refund request failed before confirmation', [
                'order_id' => $order->id,
                'exception' => $exception->getMessage(),
            ]);
            return response()->json(['message' => 'Stripe could not be reached. Check the provider dashboard before retrying.'], 502);
        }

        if (!$response->successful() || empty($response->json('id')) || !in_array($response->json('status'), ['succeeded', 'pending'], true)) {
            Log::warning('Stripe did not confirm a refund', [
                'order_id' => $order->id,
                'http_status' => $response->status(),
                'provider_status' => $response->json('status'),
            ]);
            return response()->json(['message' => 'Stripe did not confirm the refund. The order has not been marked refunded.'], 502);
        }

        $refundStatus = $response->json('status');
        $refundSucceeded = $refundStatus === 'succeeded';

        $order->update([
            'payment_status' => $refundSucceeded ? 'refunded' : 'refund_pending',
            'stripe_refund_id' => $response->json('id'),
            'refunded_at' => $refundSucceeded ? now() : null,
            'status' => $refundSucceeded ? 'cancelled' : $order->status,
        ]);

        return response()->json([
            'message' => $refundSucceeded
                ? 'Refund completed successfully.'
                : 'Refund was accepted by Stripe and is pending. The order will not be marked refunded until Stripe confirms completion.',
            'order' => $order->fresh(),
            'refund_status' => $refundStatus,
        ]);
    }
}

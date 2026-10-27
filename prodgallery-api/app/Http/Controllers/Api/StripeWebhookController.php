<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $secret = (string) config('services.stripe.webhook_secret');
        $signatureHeader = (string) $request->header('Stripe-Signature', '');
        if ($secret === '' || $signatureHeader === '') {
            return response()->json(['message' => 'Webhook is not configured'], 400);
        }

        $parts = [];
        foreach (explode(',', $signatureHeader) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            $parts[$key][] = $value;
        }
        $timestamp = (int) ($parts['t'][0] ?? 0);
        $signatures = $parts['v1'] ?? [];
        if (!$timestamp || abs(time() - $timestamp) > 300) {
            return response()->json(['message' => 'Invalid webhook timestamp'], 400);
        }

        $expected = hash_hmac('sha256', $timestamp . '.' . $request->getContent(), $secret);
        $valid = false;
        foreach ($signatures as $signature) {
            if (hash_equals($expected, $signature)) {
                $valid = true;
                break;
            }
        }
        if (!$valid) {
            return response()->json(['message' => 'Invalid webhook signature'], 400);
        }

        $event = json_decode($request->getContent(), true);
        if (!is_array($event)) {
            return response()->json(['message' => 'Invalid event payload'], 400);
        }

        if (($event['type'] ?? '') === 'checkout.session.completed') {
            $session = $event['data']['object'] ?? [];
            if (($session['payment_status'] ?? '') === 'paid') {
                $orderId = $session['metadata']['order_id'] ?? null;
                $order = Order::with('user')->find($orderId);
                if ($order && $order->payment_provider_session_id === ($session['id'] ?? null)) {
                    if ($order->payment_status !== 'paid') {
                        $order->update([
                            'payment_status' => 'paid',
                            'payment_intent_id' => $session['payment_intent'] ?? null,
                            'paid_at' => now(),
                            'status' => 'completed',
                        ]);

                        try {
                            Mail::raw(
                                "Payment received for order {$order->order_number}. Total: {$order->total_amount}. Thank you for your purchase.",
                                function ($message) use ($order) {
                                    $message->to($order->user->email)
                                        ->subject('Payment receipt - ' . $order->order_number);
                                }
                            );
                        } catch (\Throwable $exception) {
                            Log::error('Payment receipt email failed', ['order_id' => $order->id, 'exception' => $exception->getMessage()]);
                        }
                    }
                }
            }
        }

        return response()->json(['received' => true]);
    }
}

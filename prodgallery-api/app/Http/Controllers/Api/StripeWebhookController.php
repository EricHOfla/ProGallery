<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
        if (!$timestamp || abs(time() - $timestamp) > 300) {
            return response()->json(['message' => 'Invalid webhook timestamp'], 400);
        }

        $expectedSignature = hash_hmac('sha256', $timestamp . '.' . $request->getContent(), $secret);
        $signatureValid = false;
        foreach ($parts['v1'] ?? [] as $signature) {
            if (hash_equals($expectedSignature, $signature)) {
                $signatureValid = true;
                break;
            }
        }
        if (!$signatureValid) {
            return response()->json(['message' => 'Invalid webhook signature'], 400);
        }

        $event = json_decode($request->getContent(), true);
        if (!is_array($event) || empty($event['id']) || empty($event['type'])) {
            return response()->json(['message' => 'Invalid event payload'], 400);
        }

        $eventType = $event['type'];
        $object = $event['data']['object'] ?? [];

        if (in_array($eventType, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
            if (($object['payment_status'] ?? '') !== 'paid') {
                return response()->json(['received' => true]);
            }

            $orderId = $object['metadata']['order_id'] ?? null;
            $sessionId = $object['id'] ?? null;
            $expectedCurrency = strtolower((string) config('services.stripe.currency', 'usd'));
            $receivedCurrency = strtolower((string) ($object['currency'] ?? ''));
            $orderForAmount = $orderId ? Order::find($orderId) : null;
            $expectedAmount = $orderForAmount ? (int) round((float) $orderForAmount->total_amount * 100) : -1;
            $receivedAmount = isset($object['amount_total']) ? (int) $object['amount_total'] : -2;

            if (!$orderForAmount || !$sessionId || $orderForAmount->payment_provider_session_id !== $sessionId) {
                Log::warning('Stripe webhook session does not match an order', [
                    'event_id' => $event['id'],
                    'order_id' => $orderId,
                ]);
                return response()->json(['received' => true]);
            }

            if ($receivedCurrency !== $expectedCurrency || $receivedAmount !== $expectedAmount || empty($object['payment_intent'])) {
                Log::error('Stripe Checkout payment does not match the saved order', [
                    'event_id' => $event['id'],
                    'order_id' => $orderForAmount->id,
                    'expected_amount' => $expectedAmount,
                    'received_amount' => $receivedAmount,
                    'expected_currency' => $expectedCurrency,
                    'received_currency' => $receivedCurrency,
                ]);
                return response()->json(['message' => 'Payment amount, currency, or payment reference mismatch'], 400);
            }

            $order = DB::transaction(function () use ($orderForAmount, $object) {
                $order = Order::with('user')->lockForUpdate()->find($orderForAmount->id);
                if (!$order || $order->payment_status === 'paid') {
                    return null;
                }

                if (in_array($order->payment_status, ['refunded', 'refund_pending'], true) || $order->status === 'cancelled') {
                    Log::warning('Payment success received for an order that cannot be fulfilled', [
                        'order_id' => $order->id,
                        'payment_status' => $order->payment_status,
                        'status' => $order->status,
                    ]);
                    return null;
                }

                $order->update([
                    'payment_status' => 'paid',
                    'payment_intent_id' => $object['payment_intent'],
                    'paid_at' => now(),
                    'status' => 'completed',
                ]);

                return $order->fresh('user');
            });

            if ($order && $order->user && $order->user->email) {
                try {
                    Mail::raw(
                        "Payment received for order {$order->order_number}. Total: {$order->total_amount}. Thank you for your purchase.",
                        function ($message) use ($order) {
                            $message->to($order->user->email)->subject('Payment receipt - ' . $order->order_number);
                        }
                    );
                } catch (\Throwable $exception) {
                    Log::error('Payment receipt email failed', [
                        'order_id' => $order->id,
                        'exception' => $exception->getMessage(),
                    ]);
                }
            }

            return response()->json(['received' => true]);
        }

        if ($eventType === 'refund.updated') {
            $refundId = $object['id'] ?? null;
            $orderId = $object['metadata']['order_id'] ?? null;
            if (!$refundId || !$orderId) {
                return response()->json(['received' => true]);
            }

            DB::transaction(function () use ($orderId, $refundId, $object) {
                $order = Order::lockForUpdate()->find($orderId);
                if (!$order || $order->stripe_refund_id !== $refundId) {
                    return;
                }

                if (($object['status'] ?? '') === 'succeeded') {
                    $order->update([
                        'payment_status' => 'refunded',
                        'refunded_at' => $order->refunded_at ?? now(),
                        'status' => 'cancelled',
                    ]);
                } elseif (($object['status'] ?? '') === 'failed') {
                    $order->update([
                        'payment_status' => 'paid',
                        'stripe_refund_id' => null,
                        'refunded_at' => null,
                    ]);
                }
            });
        }

        return response()->json(['received' => true]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    private string $secret = 'whsec_test_progallery';

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.stripe.webhook_secret', $this->secret);
    }

    public function test_webhook_rejects_missing_signature(): void
    {
        $response = $this->call('POST', '/api/webhooks/stripe', [], [], [], [], '{"id":"evt_test","type":"customer.created"}');

        $response->assertStatus(400)->assertJson(['message' => 'Webhook is not configured']);
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $payload = json_encode(['id' => 'evt_test', 'type' => 'customer.created']);
        $timestamp = time();

        $response = $this->call('POST', '/api/webhooks/stripe', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1=invalid",
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $response->assertStatus(400)->assertJson(['message' => 'Invalid webhook signature']);
    }

    public function test_webhook_rejects_expired_signature_timestamp(): void
    {
        $payload = json_encode(['id' => 'evt_test', 'type' => 'customer.created']);
        $timestamp = time() - 600;
        $signature = hash_hmac('sha256', $timestamp . '.' . $payload, $this->secret);

        $response = $this->call('POST', '/api/webhooks/stripe', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $response->assertStatus(400)->assertJson(['message' => 'Invalid webhook timestamp']);
    }

    public function test_valid_unhandled_event_is_acknowledged(): void
    {
        $payload = json_encode(['id' => 'evt_test', 'type' => 'customer.created', 'data' => ['object' => []]]);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $payload, $this->secret);

        $response = $this->call('POST', '/api/webhooks/stripe', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $response->assertOk()->assertJson(['received' => true]);
    }


    public function test_paid_webhook_rejects_amount_mismatch_without_fulfilling_order(): void
    {
        $order = $this->makePendingOrder();
        $payload = json_encode([
            'id' => 'evt_amount_mismatch',
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_test_progallery',
                'payment_status' => 'paid',
                'currency' => 'usd',
                'amount_total' => 100,
                'payment_intent' => 'pi_test_progallery',
                'metadata' => ['order_id' => (string) $order->id],
            ]],
        ]);

        $response = $this->sendSignedPayload($payload);

        $response->assertStatus(400);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
    }

    public function test_paid_webhook_fulfils_matching_order_and_duplicate_event_is_safe(): void
    {
        $order = $this->makePendingOrder();
        $payload = json_encode([
            'id' => 'evt_payment_success',
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_test_progallery',
                'payment_status' => 'paid',
                'currency' => 'usd',
                'amount_total' => 2599,
                'payment_intent' => 'pi_test_progallery',
                'metadata' => ['order_id' => (string) $order->id],
            ]],
        ]);

        $this->sendSignedPayload($payload)->assertOk()->assertJson(['received' => true]);
        $this->sendSignedPayload($payload)->assertOk()->assertJson(['received' => true]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'paid',
            'payment_intent_id' => 'pi_test_progallery',
            'status' => 'completed',
        ]);
    }


    public function test_refund_webhook_marks_pending_refund_as_completed(): void
    {
        $order = $this->makePendingOrder();
        $order->update([
            'payment_status' => 'refund_pending',
            'payment_intent_id' => 'pi_test_progallery',
            'stripe_refund_id' => 're_test_progallery',
        ]);

        $payload = json_encode([
            'id' => 'evt_refund_updated',
            'type' => 'refund.updated',
            'data' => ['object' => [
                'id' => 're_test_progallery',
                'status' => 'succeeded',
                'metadata' => ['order_id' => (string) $order->id],
            ]],
        ]);

        $this->sendSignedPayload($payload)->assertOk()->assertJson(['received' => true]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'refunded',
            'status' => 'cancelled',
            'stripe_refund_id' => 're_test_progallery',
        ]);
        $this->assertNotNull($order->fresh()->refunded_at);
    }

    private function makePendingOrder(): Order
    {
        $user = User::factory()->create();

        return Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-TEST-' . bin2hex(random_bytes(4)),
            'total_amount' => 25.99,
            'status' => 'pending',
            'payment_method' => 'stripe',
            'shipping_address' => ['country' => 'RW'],
            'payment_status' => 'pending',
            'payment_provider_session_id' => 'cs_test_progallery',
        ]);
    }

    private function sendSignedPayload(string $payload)
    {
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $payload, $this->secret);

        return $this->call('POST', '/api/webhooks/stripe', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
    }

    public function test_webhook_rejects_malformed_json(): void
    {
        $payload = '{invalid json';
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $payload, $this->secret);

        $response = $this->call('POST', '/api/webhooks/stripe', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $response->assertStatus(400)->assertJson(['message' => 'Invalid event payload']);
    }
}

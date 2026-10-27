<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
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

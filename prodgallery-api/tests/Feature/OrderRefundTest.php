<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OrderRefundTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_stripe_refund_is_not_marked_as_completed(): void
    {
        Config::set('services.stripe.secret', 'sk_test_progallery');
        Http::fake([
            'https://api.stripe.com/v1/refunds' => Http::response([
                'id' => 're_pending_test',
                'status' => 'pending',
            ], 200),
        ]);

        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create();
        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-REFUND-' . bin2hex(random_bytes(4)),
            'total_amount' => 25.99,
            'status' => 'completed',
            'payment_method' => 'stripe',
            'shipping_address' => ['country' => 'RW'],
            'payment_status' => 'paid',
            'payment_intent_id' => 'pi_refund_test',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/orders/' . $order->id . '/refund');

        $response->assertOk()->assertJsonPath('refund_status', 'pending');
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'refund_pending',
            'status' => 'completed',
            'stripe_refund_id' => 're_pending_test',
            'refunded_at' => null,
        ]);

        Http::assertSent(function ($request) use ($order) {
            return $request->url() === 'https://api.stripe.com/v1/refunds'
                && $request['payment_intent'] === 'pi_refund_test'
                && (($request['metadata']['order_id'] ?? null) === (string) $order->id
                    || ($request['metadata[order_id]'] ?? null) === (string) $order->id);
        });
    }

    public function test_unpaid_order_cannot_be_refunded(): void
    {
        Config::set('services.stripe.secret', 'sk_test_progallery');
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create();
        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-UNPAID-' . bin2hex(random_bytes(4)),
            'total_amount' => 25.99,
            'status' => 'pending',
            'payment_method' => 'stripe',
            'shipping_address' => ['country' => 'RW'],
            'payment_status' => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/orders/' . $order->id . '/refund')
            ->assertStatus(422);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
    }
}

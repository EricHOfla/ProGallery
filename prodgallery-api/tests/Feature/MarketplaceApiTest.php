<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Collection;
use App\Models\NewsletterSubscriber;
use App\Models\Photo;
use App\Models\PhotoReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MarketplaceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_photographer_directory_does_not_expose_private_account_fields(): void
    {
        $photographer = User::factory()->create([
            'role' => 'photographer',
            'email' => 'creator@example.com',
            'photographer_bio' => 'Landscape photographer',
            'photographer_verified_at' => now(),
        ]);

        $response = $this->getJson('/api/photographers')->assertOk()
            ->assertJsonPath('data.0.id', $photographer->id)
            ->assertJsonPath('data.0.photographer_bio', 'Landscape photographer');

        $this->assertStringNotContainsString('creator@example.com', $response->getContent());
    }

    public function test_public_collection_directory_only_returns_published_collections(): void
    {
        Collection::create(['title' => 'Public Nature', 'slug' => 'public-nature', 'status' => 'published']);
        Collection::create(['title' => 'Private Draft', 'slug' => 'private-draft', 'status' => 'draft']);

        $this->getJson('/api/collections')
            ->assertOk()
            ->assertJsonFragment(['slug' => 'public-nature'])
            ->assertJsonMissing(['slug' => 'private-draft']);
    }

    public function test_newsletter_subscription_can_be_unsubscribed_with_token(): void
    {
        $this->postJson('/api/newsletter/subscribe', ['email' => 'reader@example.com'])
            ->assertCreated();

        $subscriber = NewsletterSubscriber::where('email', 'reader@example.com')->firstOrFail();
        $this->assertNotNull($subscriber->subscribed_at);
        $this->postJson('/api/newsletter/unsubscribe', ['token' => $subscriber->unsubscribe_token])
            ->assertOk();

        $this->assertNotNull($subscriber->fresh()->unsubscribed_at);
    }

    public function test_visitor_can_submit_a_photo_report(): void
    {
        $category = Category::create(['name' => 'Nature', 'slug' => 'nature']);
        $photo = Photo::create([
            'title' => 'Reported photo',
            'category_id' => $category->id,
            'price' => 10,
            'image' => '/storage/photos/report.jpg',
            'is_active' => true,
        ]);

        $this->postJson('/api/photo-reports', [
            'photo_id' => $photo->id,
            'reason' => 'copyright',
            'details' => 'I own the rights to this image.',
        ])->assertCreated();

        $this->assertDatabaseHas('photo_reports', [
            'photo_id' => $photo->id,
            'reason' => 'copyright',
            'status' => 'open',
        ]);
    }

    public function test_admin_can_create_a_published_collection(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/collections', [
            'title' => 'Featured Landscapes',
            'status' => 'published',
            'is_featured' => true,
        ])->assertCreated()
            ->assertJsonPath('title', 'Featured Landscapes')
            ->assertJsonPath('status', 'published');

        $this->assertDatabaseHas('collections', [
            'slug' => 'featured-landscapes',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_verify_a_photographer(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $photographer = User::factory()->create(['role' => 'photographer']);
        Sanctum::actingAs($admin);

        $this->putJson('/api/admin/photographers/' . $photographer->id, ['verified' => true])
            ->assertOk()
            ->assertJsonPath('photographer.id', $photographer->id);

        $this->assertNotNull($photographer->fresh()->photographer_verified_at);
    }
}

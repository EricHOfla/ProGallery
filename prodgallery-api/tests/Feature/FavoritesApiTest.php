<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FavoritesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_add_list_and_remove_a_favorite(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $category = Category::create([
            'name' => 'Nature',
            'slug' => 'nature',
            'description' => 'Nature photos',
        ]);
        $photo = Photo::create([
            'title' => 'Mountain',
            'description' => 'Mountain at sunrise',
            'category_id' => $category->id,
            'price' => 10,
            'image' => '/storage/photos/mountain.jpg',
            'is_active' => true,
        ]);

        $this->postJson('/api/favorites', ['photo_id' => $photo->id])
            ->assertCreated()
            ->assertJsonPath('photo_id', $photo->id);

        $this->getJson('/api/favorites')
            ->assertOk()
            ->assertJsonPath('data.0.photo_id', $photo->id);

        $this->deleteJson('/api/favorites/' . $photo->id)
            ->assertOk();

        $this->getJson('/api/favorites')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_favorites_require_authentication(): void
    {
        $this->getJson('/api/favorites')->assertUnauthorized();
    }
}

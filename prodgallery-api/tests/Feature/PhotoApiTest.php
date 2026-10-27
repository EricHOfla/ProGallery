<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Photo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhotoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_photo_list_is_paginated_and_excludes_inactive_photos(): void
    {
        $category = Category::create([
            'name' => 'Nature',
            'slug' => 'nature',
            'description' => 'Nature photography',
        ]);

        foreach (range(1, 13) as $index) {
            Photo::create([
                'title' => 'Photo ' . $index,
                'description' => 'Test photo',
                'category_id' => $category->id,
                'price' => 12.50,
                'image' => '/storage/photos/test-' . $index . '.jpg',
                'is_active' => true,
            ]);
        }

        Photo::create([
            'title' => 'Hidden photo',
            'category_id' => $category->id,
            'price' => 12.50,
            'image' => '/storage/photos/hidden.jpg',
            'is_active' => false,
        ]);

        $this->getJson('/api/photos')
            ->assertOk()
            ->assertJsonCount(12, 'data')
            ->assertJsonPath('total', 13)
            ->assertJsonPath('last_page', 2);
    }

    public function test_inactive_photo_cannot_be_opened_by_id(): void
    {
        $category = Category::create([
            'name' => 'Nature',
            'slug' => 'nature',
        ]);

        $photo = Photo::create([
            'title' => 'Hidden photo',
            'category_id' => $category->id,
            'price' => 12.50,
            'image' => '/storage/photos/hidden.jpg',
            'is_active' => false,
        ]);

        $this->getJson('/api/photos/' . $photo->id)->assertNotFound();
    }
}

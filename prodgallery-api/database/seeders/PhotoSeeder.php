<?php

namespace Database\Seeders;

use App\Models\Photo;
use App\Models\Category;
use Illuminate\Database\Seeder;

class PhotoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        $photos = [
            [
                'title' => 'Mountain Sunrise',
                'description' => 'Beautiful mountain landscape at sunrise with golden light',
                'category_id' => $categories->where('slug', 'nature')->first()->id,
                'price' => 49.99,
                'image' => 'https://via.placeholder.com/400x300?text=Mountain+Sunrise',
                'photographer' => 'John Smith',
                'width' => 3000,
                'height' => 2000,
                'featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Ocean Waves',
                'description' => 'Powerful ocean waves crashing on the beach',
                'category_id' => $categories->where('slug', 'nature')->first()->id,
                'price' => 39.99,
                'image' => 'https://via.placeholder.com/400x300?text=Ocean+Waves',
                'photographer' => 'Jane Doe',
                'width' => 3000,
                'height' => 2000,
                'featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Coffee and Books',
                'description' => 'Cozy morning with coffee and reading',
                'category_id' => $categories->where('slug', 'food')->first()->id,
                'price' => 29.99,
                'image' => 'https://via.placeholder.com/400x300?text=Coffee+Books',
                'photographer' => 'Mike Johnson',
                'width' => 2400,
                'height' => 1800,
                'featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'Modern Fashion',
                'description' => 'Contemporary fashion style and trends',
                'category_id' => $categories->where('slug', 'fashion')->first()->id,
                'price' => 59.99,
                'image' => 'https://via.placeholder.com/400x300?text=Modern+Fashion',
                'photographer' => 'Sarah Williams',
                'width' => 2400,
                'height' => 3000,
                'featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Product Showcase',
                'description' => 'Professional product photography for e-commerce',
                'category_id' => $categories->where('slug', 'products')->first()->id,
                'price' => 44.99,
                'image' => 'https://via.placeholder.com/400x300?text=Product+Showcase',
                'photographer' => 'Tom Brown',
                'width' => 2000,
                'height' => 2000,
                'featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'Professional Portrait',
                'description' => 'Elegant professional headshot',
                'category_id' => $categories->where('slug', 'portraits')->first()->id,
                'price' => 34.99,
                'image' => 'https://via.placeholder.com/400x300?text=Professional+Portrait',
                'photographer' => 'Emma Davis',
                'width' => 2000,
                'height' => 2500,
                'featured' => false,
                'is_active' => true,
            ],
        ];

        foreach ($photos as $photo) {
            Photo::create($photo);
        }
    }
}

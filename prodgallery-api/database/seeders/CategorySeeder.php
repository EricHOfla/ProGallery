<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Products',
                'slug' => 'products',
                'description' => 'Professional product photography showcasing details and quality'
            ],
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'description' => 'Fashion and apparel photography for every style'
            ],
            [
                'name' => 'Food',
                'slug' => 'food',
                'description' => 'Appetizing food and culinary photography'
            ],
            [
                'name' => 'Lifestyle',
                'slug' => 'lifestyle',
                'description' => 'Lifestyle and everyday moments captured beautifully'
            ],
            [
                'name' => 'Nature',
                'slug' => 'nature',
                'description' => 'Stunning nature and landscape photography'
            ],
            [
                'name' => 'Portraits',
                'slug' => 'portraits',
                'description' => 'Professional portrait and headshot photography'
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}

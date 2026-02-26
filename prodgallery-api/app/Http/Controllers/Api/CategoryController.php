<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categoriesQuery = Category::query()
            ->select(['id', 'name', 'slug', 'description', 'created_at', 'updated_at'])
            ->orderBy('name');

        if ($request->query('include') === 'photos') {
            $categoriesQuery->with(['photos' => function ($query) {
                $query->where('is_active', true);
            }]);
        } else {
            $categoriesQuery->withCount(['photos' => function ($query) {
                $query->where('is_active', true);
            }]);
        }

        $categories = $categoriesQuery->get();
        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::with(['photos' => function ($query) {
            $query->where('is_active', true);
        }])->findOrFail($id);
        return response()->json($category);
    }
}

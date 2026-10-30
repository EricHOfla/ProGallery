<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function index(Request $request)
    {
        $query = Photo::with(['category', 'photographerProfile:id,name,photographer_verified_at'])->where('is_active', true)->where('moderation_status', 'approved');

        // Search by title or description
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('featured', true);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by tags without trusting arbitrary SQL column names.
        if ($request->filled('tag')) {
            $tag = trim((string) $request->input('tag'));
            $query->whereJsonContains('tags', $tag);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = strtolower((string) $request->get('sort_order', 'desc'));
        if (!in_array($sortOrder, ['asc', 'desc'], true)) $sortOrder = 'desc';
        $allowedSorts = ['created_at', 'price', 'title'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min(max((int) $request->get('per_page', 12), 1), 48);
        $photos = $query->paginate($perPage);

        return response()->json($photos);
    }

    public function show($id)
    {
        $photo = Photo::with(['category', 'photographerProfile:id,name,photographer_bio,photographer_avatar,photographer_verified_at'])
            ->where('is_active', true)->where('moderation_status', 'approved')->findOrFail($id);
        $photo->increment('views_count');
        return response()->json($photo->fresh(['category', 'photographerProfile:id,name,photographer_bio,photographer_avatar,photographer_verified_at']));
    }
}

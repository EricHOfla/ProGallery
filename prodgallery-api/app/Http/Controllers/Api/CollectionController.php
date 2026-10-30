<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index()
    {
        return response()->json(Collection::where('status', 'published')->withCount('photos')->orderByDesc('is_featured')->latest()->paginate(20));
    }

    public function show(string $slug)
    {
        $collection = Collection::where('status', 'published')->where('slug', $slug)
            ->with(['photos' => fn ($q) => $q->where('is_active', true)->where('moderation_status', 'approved')->with('category')])
            ->withCount('photos')->firstOrFail();

        return response()->json($collection);
    }
}

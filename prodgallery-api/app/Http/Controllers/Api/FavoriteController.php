<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Favorite::with('photo.category')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->paginate(24)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['photo_id' => 'required|integer|exists:photos,id']);
        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'photo_id' => $validated['photo_id'],
        ]);

        return response()->json($favorite->load('photo.category'), $favorite->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, int $photoId)
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('photo_id', $photoId)
            ->delete();

        return response()->json(['message' => 'Favorite removed']);
    }
}

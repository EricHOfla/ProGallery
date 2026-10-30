<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($photoId)
    {
        $reviews = Review::with('user:id,name')
            ->where('photo_id', $photoId)
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'photo_id' => 'required|exists:photos,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $hasPaidPurchase = \\App\\Models\\OrderItem::where('photo_id', $request->photo_id)
            ->whereHas('order', fn ($query) => $query->where('user_id', $request->user()->id)->where('payment_status', 'paid'))
            ->exists();

        if (!$hasPaidPurchase) {
            return response()->json(['message' => 'Only customers with a confirmed purchase can review this photograph.'], 403);
        }

        $review = Review::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'photo_id' => $request->photo_id,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return response()->json($review->load('user:id,name'), 201);
    }

    public function destroy(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}

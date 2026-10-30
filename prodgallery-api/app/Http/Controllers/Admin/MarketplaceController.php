<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\NewsletterSubscriber;
use App\Models\PhotoReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MarketplaceController extends Controller
{
    public function photographers()
    {
        return response()->json(User::where('role', 'photographer')->withCount('photos')->latest()->paginate(30));
    }

    public function updatePhotographer(Request $request, int $id)
    {
        $user = User::where('role', 'photographer')->findOrFail($id);
        $data = $request->validate([
            'verified' => 'sometimes|boolean',
            'suspended' => 'sometimes|boolean',
        ]);
        if (array_key_exists('verified', $data)) $user->photographer_verified_at = $data['verified'] ? ($user->photographer_verified_at ?? now()) : null;
        if (array_key_exists('suspended', $data)) $user->is_suspended = $data['suspended'];
        $user->save();
        return response()->json(['message' => 'Photographer updated.', 'photographer' => $user->fresh()]);
    }

    public function collections()
    {
        return response()->json(Collection::withCount('photos')->latest()->paginate(30));
    }

    public function storeCollection(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:160',
            'slug' => 'nullable|string|max:180|alpha_dash|unique:collections,slug',
            'description' => 'nullable|string|max:5000',
            'cover_image' => 'nullable|string|max:2048',
            'status' => 'required|in:draft,published',
            'is_featured' => 'sometimes|boolean',
            'photo_ids' => 'sometimes|array',
            'photo_ids.*' => 'integer|distinct|exists:photos,id',
        ]);
        $photoIds = $data['photo_ids'] ?? [];
        unset($data['photo_ids']);
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']) . '-' . Str::lower(Str::random(5));
        $collection = Collection::create($data);
        $collection->photos()->sync($photoIds);
        return response()->json($collection->load('photos'), 201);
    }

    public function updateCollection(Request $request, int $id)
    {
        $collection = Collection::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|string|max:160',
            'slug' => 'sometimes|string|max:180|alpha_dash|unique:collections,slug,' . $id,
            'description' => 'nullable|string|max:5000',
            'cover_image' => 'nullable|string|max:2048',
            'status' => 'sometimes|in:draft,published',
            'is_featured' => 'sometimes|boolean',
            'photo_ids' => 'sometimes|array',
            'photo_ids.*' => 'integer|distinct|exists:photos,id',
        ]);
        if (array_key_exists('photo_ids', $data)) $collection->photos()->sync($data['photo_ids']);
        unset($data['photo_ids']);
        $collection->update($data);
        return response()->json($collection->fresh('photos'));
    }

    public function deleteCollection(int $id)
    {
        Collection::findOrFail($id)->delete();
        return response()->json(['message' => 'Collection deleted.']);
    }

    public function reports()
    {
        return response()->json(PhotoReport::with(['photo:id,title,image', 'reporter:id,name,email'])->latest()->paginate(30));
    }

    public function updateReport(Request $request, int $id)
    {
        $report = PhotoReport::findOrFail($id);
        $data = $request->validate([
            'status' => 'required|in:open,reviewing,resolved,rejected',
            'resolution_note' => 'nullable|string|max:3000',
            'deactivate_photo' => 'sometimes|boolean',
        ]);
        if (!empty($data['deactivate_photo'])) $report->photo()->update(['is_active' => false, 'moderation_status' => 'removed']);
        unset($data['deactivate_photo']);
        $report->update([...$data, 'reviewed_by' => $request->user()->id]);
        return response()->json(['message' => 'Report updated.', 'report' => $report->fresh()]);
    }

    public function subscribers()
    {
        return response()->json(NewsletterSubscriber::orderByDesc('subscribed_at')->paginate(50));
    }
}

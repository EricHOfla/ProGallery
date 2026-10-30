<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Photo;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PhotographerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->where('role', 'photographer')->where('is_suspended', false)
            ->select(['id', 'name', 'photographer_bio', 'photographer_avatar', 'photographer_website', 'photographer_social_links', 'photographer_verified_at'])
            ->withCount(['photos as published_photos_count' => fn ($q) => $q->where('is_active', true)->where('moderation_status', 'approved')]);

        if ($request->filled('search')) {
            $term = trim($request->string('search')->toString());
            $query->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('photographer_bio', 'like', "%{$term}%"));
        }

        if ($request->boolean('verified')) $query->whereNotNull('photographer_verified_at');

        $query->orderByDesc('photographer_verified_at')->orderBy('name');

        return response()->json($query->paginate(20));
    }

    public function show(string $id)
    {
        $photographer = User::query()->where('role', 'photographer')->where('is_suspended', false)
            ->withCount(['photos as published_photos_count' => fn ($q) => $q->where('is_active', true)->where('moderation_status', 'approved')])
            ->findOrFail($id);

        return response()->json([
            'id' => $photographer->id,
            'name' => $photographer->name,
            'bio' => $photographer->photographer_bio,
            'avatar' => $photographer->photographer_avatar,
            'website' => $photographer->photographer_website,
            'social_links' => $photographer->photographer_social_links,
            'verified' => (bool) $photographer->photographer_verified_at,
            'published_photos_count' => $photographer->published_photos_count,
            'photos' => $photographer->photos()->where('is_active', true)->where('moderation_status', 'approved')->latest()->paginate(24),
        ]);
    }


    private function ensurePhotographer(Request $request)
    {
        abort_unless($request->user() && $request->user()->role === 'photographer' && !$request->user()->is_suspended, 403, 'An active photographer account is required.');
        return $request->user();
    }

    public function dashboard(Request $request)
    {
        $user = $this->ensurePhotographer($request);
        $photos = $user->photos();
        $paidItems = OrderItem::query()
            ->whereHas('photo', fn ($q) => $q->where('photographer_id', $user->id))
            ->whereHas('order', fn ($q) => $q->where('payment_status', 'paid'));
        return response()->json([
            'total_photos' => (clone $photos)->count(),
            'published_photos' => (clone $photos)->where('is_active', true)->where('moderation_status', 'approved')->count(),
            'pending_photos' => (clone $photos)->where('moderation_status', 'pending')->count(),
            'paid_sales' => (clone $paidItems)->count(),
            'earnings' => (clone $paidItems)->sum(DB::raw('order_items.price * order_items.quantity')),
        ]);
    }

    public function myPhotos(Request $request)
    {
        $user = $this->ensurePhotographer($request);
        return response()->json($user->photos()->with('category')->latest()->paginate(20));
    }

    public function storePhoto(Request $request)
    {
        $user = $this->ensurePhotographer($request);
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0.01|max:999999',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
            'tags' => 'nullable|array|max:20',
            'tags.*' => 'string|max:60',
            'copyright_confirmed' => 'required|accepted',
        ]);

        $file = $request->file('image');
        $path = Storage::disk('public')->putFile('photos', $file);
        $dimensions = @getimagesize($file->getRealPath());

        $photo = Photo::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'category_id' => $data['category_id'],
            'price' => $data['price'],
            'image' => Storage::disk('public')->url($path),
            'photographer' => $user->name,
            'photographer_id' => $user->id,
            'width' => $dimensions[0] ?? null,
            'height' => $dimensions[1] ?? null,
            'file_format' => strtolower($file->getClientOriginalExtension()),
            'file_size' => $file->getSize(),
            'tags' => $data['tags'] ?? [],
            'copyright_confirmed' => true,
            'moderation_status' => 'pending',
            'is_active' => false,
            'published_at' => null,
        ]);

        return response()->json(['message' => 'Photo submitted for admin review.', 'photo' => $photo->load('category')], 201);
    }

    public function updatePhoto(Request $request, int $id)
    {
        $user = $this->ensurePhotographer($request);
        $photo = Photo::where('photographer_id', $user->id)->findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:5000',
            'category_id' => 'sometimes|exists:categories,id',
            'price' => 'sometimes|numeric|min:0.01|max:999999',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'tags' => 'nullable|array|max:20',
            'tags.*' => 'string|max:60',
            'copyright_confirmed' => 'sometimes|accepted',
        ]);

        if ($request->hasFile('image')) {
            $path = Storage::disk('public')->putFile('photos', $request->file('image'));
            $data['image'] = Storage::disk('public')->url($path);
            $data['file_format'] = strtolower($request->file('image')->getClientOriginalExtension());
            $data['file_size'] = $request->file('image')->getSize();
            $dimensions = @getimagesize($request->file('image')->getRealPath());
            $data['width'] = $dimensions[0] ?? null;
            $data['height'] = $dimensions[1] ?? null;
        }

        unset($data['copyright_confirmed']);
        $data['moderation_status'] = 'pending';
        $data['is_active'] = false;
        $data['published_at'] = null;
        $photo->update($data);

        return response()->json(['message' => 'Photo changes submitted for admin review.', 'photo' => $photo->fresh('category')]);
    }

    public function deletePhoto(Request $request, int $id)
    {
        $user = $this->ensurePhotographer($request);
        $photo = Photo::where('photographer_id', $user->id)->findOrFail($id);
        $hasPaidSales = OrderItem::where('photo_id', $photo->id)->whereHas('order', fn ($q) => $q->where('payment_status', 'paid'))->exists();
        if ($hasPaidSales) {
            return response()->json(['message' => 'This photo has completed purchases and cannot be deleted. Contact support if it must be removed.'], 409);
        }
        $photo->delete();
        return response()->json(['message' => 'Photo deleted.']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['photographer', 'admin'], true)) {
            return response()->json(['message' => 'A photographer account is required to edit this profile.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'photographer_bio' => ['nullable', 'string', 'max:3000'],
            'photographer_website' => ['nullable', 'url', 'max:255'],
            'photographer_social_links' => ['nullable', 'array'],
            'photographer_social_links.instagram' => ['nullable', 'url', 'max:255'],
            'photographer_social_links.facebook' => ['nullable', 'url', 'max:255'],
            'photographer_social_links.x' => ['nullable', 'url', 'max:255'],
            'photographer_social_links.youtube' => ['nullable', 'url', 'max:255'],
        ]);

        $user->update($validated);

        return response()->json(['message' => 'Photographer profile updated.', 'profile' => $user->fresh()]);
    }
}

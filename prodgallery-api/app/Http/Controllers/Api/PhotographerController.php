<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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

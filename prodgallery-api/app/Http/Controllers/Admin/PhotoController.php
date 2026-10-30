<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoController extends Controller
{
    public function index()
    {
        $photos = Photo::with('category')->orderBy('created_at', 'desc')->paginate(20);
        return response()->json($photos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'photographer' => 'nullable|string|max:255',
            'photographer_id' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:60',
            'copyright_confirmed' => 'sometimes|boolean',
            'moderation_status' => 'sometimes|in:pending,approved,rejected,removed',
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
            'featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Handle file upload
        $imagePath = $this->storeImage($request->file('image'));

        $photoData = $request->except(['image']);
        $photoData['image'] = $imagePath;
        $photoData['published_at'] = ($photoData['is_active'] ?? true) && ($photoData['moderation_status'] ?? 'approved') === 'approved' ? now() : null;

        $photo = Photo::create($photoData);
        return response()->json($photo, 201);
    }

    public function update(Request $request, $id)
    {
        $photo = Photo::findOrFail($id);
        
        $request->validate([
            'title' => 'string',
            'category_id' => 'exists:categories,id',
            'price' => 'numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'photographer' => 'nullable|string|max:255',
            'photographer_id' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:60',
            'copyright_confirmed' => 'sometimes|boolean',
            'moderation_status' => 'sometimes|in:pending,approved,rejected,removed',
            'is_active' => 'sometimes|boolean',
            'featured' => 'sometimes|boolean',
        ]);

        $updateData = $request->except(['image']);

        // Handle file upload if a new image is provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($photo->image && Storage::disk('public')->exists($photo->image)) {
                Storage::disk('public')->delete($photo->image);
            }
            $updateData['image'] = $this->storeImage($request->file('image'));
        } else {
            // Remove image field if not provided
            unset($updateData['image']);
        }

        if (array_key_exists('is_active', $updateData) || array_key_exists('moderation_status', $updateData)) {
            $willBeActive = $updateData['is_active'] ?? $photo->is_active;
            $willBeApproved = ($updateData['moderation_status'] ?? $photo->moderation_status) === 'approved';
            $updateData['published_at'] = $willBeActive && $willBeApproved ? ($photo->published_at ?? now()) : null;
        }
        $photo->update($updateData);
        return response()->json($photo);
    }

    /**
     * Store uploaded image and return path
     */
    private function storeImage($file)
    {
        $path = Storage::disk('public')->putFile('photos', $file);
        return Storage::disk('public')->url($path);
    }

    public function destroy($id)
    {
        $photo = Photo::findOrFail($id);
        
        // Delete image file if exists
        if ($photo->image && Storage::disk('public')->exists($photo->image)) {
            Storage::disk('public')->delete($photo->image);
        }
        
        $photo->delete();
        return response()->json(['message' => 'Photo deleted successfully']);
    }
}

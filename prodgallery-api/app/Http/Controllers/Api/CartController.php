<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Photo;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = Cart::with('photo.category')
            ->where('user_id', $request->user()->id)
            ->get();

        $settings = StoreSetting::values();
        $cart->each(function ($item) use ($settings) {
            $item->setAttribute('price', round((float) $item->photo->price * $this->licenseMultiplier($item->license_type, $settings), 2));
        });

        return response()->json($cart);
    }

    public function add(Request $request)
    {
        $request->validate([
            'photo_id' => 'required|exists:photos,id',
            'quantity' => 'required|integer|min:1',
            'license_type' => 'sometimes|in:personal,commercial,extended',
        ]);

        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('photo_id', $request->photo_id)
            ->where('license_type', $request->input('license_type', 'personal'))
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $request->quantity);
            return response()->json($cartItem);
        }

        $cart = Cart::create([
            'user_id' => $request->user()->id,
            'photo_id' => $request->photo_id,
            'quantity' => $request->quantity,
            'license_type' => $request->input('license_type', 'personal'),
        ]);

        return response()->json($cart, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::findOrFail($id);
        $this->authorize('update', $cart);

        $cart->update(['quantity' => $request->quantity]);
        return response()->json($cart);
    }

    public function remove($id)
    {
        $cart = Cart::findOrFail($id);
        $this->authorize('delete', $cart);
        $cart->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    private function licenseMultiplier(string $license, array $settings): float
    {
        return (float) ($settings[$license . '_license_multiplier'] ?? match ($license) {
            'commercial' => 2,
            'extended' => 5,
            default => 1,
        });
    }

    public function clear(Request $request)
    {
        Cart::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}

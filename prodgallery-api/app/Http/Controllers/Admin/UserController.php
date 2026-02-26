<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount('orders')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:customer,admin',
        ]);

        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:customer,admin',
        ]);

        $data = [];
        
        if ($request->has('first_name') || $request->has('last_name')) {
            $firstName = $request->first_name ?? $user->first_name;
            $lastName = $request->last_name ?? $user->last_name;
            $data['name'] = $firstName . ' ' . $lastName;
            $data['first_name'] = $firstName;
            $data['last_name'] = $lastName;
        }

        if ($request->has('email')) {
            $data['email'] = $request->email;
        }

        if ($request->has('role')) {
            // Prevent removing the last admin
            if ($user->role === 'admin' && $request->role !== 'admin') {
                $adminCount = User::where('role', 'admin')->count();
                if ($adminCount <= 1) {
                    throw ValidationException::withMessages([
                        'role' => ['Cannot remove the last admin user.'],
                    ]);
                }
            }
            $data['role'] = $request->role;
        }

        $user->update($data);
        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting the last admin
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot delete the last admin user.'
                ], 403);
            }
        }

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Cannot delete your own account.'
            ], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}

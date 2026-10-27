<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class StoreSettingController extends Controller
{
    public function index()
    {
        return response()->json(StoreSetting::values());
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:120',
            'support_email' => 'nullable|email|max:255',
            'support_phone' => 'nullable|string|max:40',
            'personal_license_multiplier' => 'required|numeric|min:1|max:20',
            'commercial_license_multiplier' => 'required|numeric|min:1|max:50',
            'extended_license_multiplier' => 'required|numeric|min:1|max:100',
            'refund_policy' => 'required|string|max:5000',
            'delivery_policy' => 'required|string|max:5000',
        ]);

        foreach ($validated as $key => $value) {
            StoreSetting::updateOrCreate(['key' => $key], ['value' => (string) ($value ?? '')]);
        }

        StoreSetting::forgetCache();

        return response()->json([
            'message' => 'Store settings saved.',
            'settings' => StoreSetting::values(),
        ]);
    }
}

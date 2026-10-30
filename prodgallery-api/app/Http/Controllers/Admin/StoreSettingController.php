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

    public function publicSettings()
    {
        $settings = StoreSetting::values();

        return response()->json([
            'store_name' => $settings['store_name'],
            'support_email' => $settings['support_email'],
            'support_phone' => $settings['support_phone'],
            'refund_policy' => $settings['refund_policy'],
            'delivery_policy' => $settings['delivery_policy'],
            'personal_license_terms' => $settings['personal_license_terms'],
            'commercial_license_terms' => $settings['commercial_license_terms'],
            'extended_license_terms' => $settings['extended_license_terms'],
            'license_terms_version' => $settings['license_terms_version'],
        ]);
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
            'personal_license_terms' => 'required|string|max:5000',
            'commercial_license_terms' => 'required|string|max:5000',
            'extended_license_terms' => 'required|string|max:5000',
            'license_terms_version' => 'required|string|max:40',
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

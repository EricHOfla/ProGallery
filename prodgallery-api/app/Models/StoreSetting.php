<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class StoreSetting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function defaults(): array
    {
        return [
            'store_name' => 'ProGallery',
            'support_email' => '',
            'support_phone' => '',
            'personal_license_multiplier' => '1',
            'commercial_license_multiplier' => '2',
            'extended_license_multiplier' => '5',
            'refund_policy' => 'Contact support to request a refund. Refund eligibility is reviewed according to the store policy and applicable law.',
            'delivery_policy' => 'Digital downloads become available after payment has been confirmed by the payment provider.',
        ];
    }

    public static function values(): array
    {
        return Cache::remember('progallery.store_settings', 300, function () {
            return array_merge(
                self::defaults(),
                self::query()->pluck('value', 'key')->all()
            );
        });
    }

    public static function valueFor(string $key, mixed $fallback = null): mixed
    {
        $values = self::values();
        return $values[$key] ?? $fallback;
    }

    public static function forgetCache(): void
    {
        Cache::forget('progallery.store_settings');
    }
}

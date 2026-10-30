<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = ['order_id', 'photo_id', 'quantity', 'price', 'license_type', 'license_terms', 'license_version'];

    protected $casts = ['price' => 'decimal:2'];

    public function order() { return $this->belongsTo(Order::class); }
    public function photo() { return $this->belongsTo(Photo::class); }
}

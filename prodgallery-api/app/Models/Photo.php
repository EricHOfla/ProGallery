<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    protected $fillable = [
        'title', 'description', 'category_id', 'price', 'image',
        'photographer', 'photographer_id', 'width', 'height', 'featured', 'is_active', 'tags', 'file_format', 'file_size', 'views_count', 'downloads_count', 'moderation_status', 'copyright_confirmed', 'published_at'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'featured' => 'boolean',
        'is_active' => 'boolean',
        'tags' => 'array',
        'copyright_confirmed' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function photographerProfile()
    {
        return $this->belongsTo(User::class, 'photographer_id');
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class)->withPivot('position')->withTimestamps();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function averageRating()
    {
        return $this->reviews()->avg('rating');
    }
}

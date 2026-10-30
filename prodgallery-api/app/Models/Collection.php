<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $fillable = ['user_id', 'title', 'slug', 'description', 'cover_image', 'status', 'is_featured'];

    protected $casts = ['is_featured' => 'boolean'];

    public function photos()
    {
        return $this->belongsToMany(Photo::class)->withPivot('position')->withTimestamps()->orderByPivot('position');
    }

    public function photographer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhotoReport extends Model
{
    protected $fillable = ['photo_id', 'user_id', 'reviewed_by', 'reason', 'details', 'status', 'resolution_note'];

    public function photo() { return $this->belongsTo(Photo::class); }
    public function reporter() { return $this->belongsTo(User::class, 'user_id'); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}

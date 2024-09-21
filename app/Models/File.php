<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class File extends Model
{
    static $type = ['doc', 'pdf', 'image', 'video', 'other'];
    use HasFactory;
    protected $fillable = [
        'type',
        'url',
        'name',
        'path',
        'user_id'
    ];
    protected $hidden = [
        'path'
    ];

    public function messages(): BelongsToMany
    {
        return $this->belongsToMany(Message::class);
    }
}

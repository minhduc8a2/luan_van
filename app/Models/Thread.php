<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Thread extends Model
{
    use HasFactory;
    protected $fillable = [
        "message_id"
    ];
   
    public function messages(): MorphMany
    {
        return $this->morphMany(Message::class, 'messagable');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}

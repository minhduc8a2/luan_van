<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reaction extends Model
{
    use HasFactory;

    protected $fillable = ["emoji_id","user_id","message_id"];


    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}

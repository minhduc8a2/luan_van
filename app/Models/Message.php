<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Message extends Model
{
    use HasFactory;
    protected $fillable = ['content', 'user_id', 'messagable_id', 'messagable_type', 'created_at'];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function messagable(): MorphTo
    {
        return $this->morphTo();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function thread(): HasOne
    {
        return $this->hasOne(Thread::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    
}

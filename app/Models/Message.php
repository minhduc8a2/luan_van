<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;
    protected $fillable = ['content', 'user_id', 'channel_id','created_at'];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }
}

<?php

namespace App\Models;

use App\Helpers\Helper;
use App\Events\MessageEvent;
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

    public function threadMessages(): HasManyThrough
    {
        return $this->hasManyThrough(Thread::class, Message::class);
    }
    public static function createStringMessageAndBroadcast(Channel $channel, User $user, string $content)
    {
        $content = Helper::sanitizeContent($content);
        $message = Message::create([
            'content' => $content,
            'messagable_id' => $channel->id,
            'messagable_type' => Channel::class,
            'user_id' => $user->id
        ]);
        broadcast(new MessageEvent($channel, $message->load([
            'attachments',
            'reactions',
            'thread' => function ($query) {
                $query->withCount('messages');
            }
        ])));
        return $message;
    }
}

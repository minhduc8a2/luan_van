<?php

namespace App\Models;

use App\Helpers\Helper;

use App\Events\MessageEvent;
use App\Observers\MessageObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


#[ObservedBy([MessageObserver::class])]
class Message extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'content',
        'user_id',
        'channel_id',
        'created_at',
        'is_auto_generated',
        "forwarded_message_id",
        "threaded_message_id"
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): BelongsToMany
    {
        return $this->belongsToMany(File::class);
    }
    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }


    public function forwardedMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'forwarded_message_id');
    }
    public function forwardedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'forwarded_message_id');
    }

    public function threadedMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'threaded_message_id');
    }
    public function threadMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'threaded_message_id');
    }
    public static function createStringMessageAndBroadcast(Channel $channel, User $user, string $content)
    {
        $content = Helper::sanitizeContent($content);
        $message = Message::create([
            'content' => $content,
            'channel_id' => $channel->id,

            'user_id' => $user->id,
            'is_auto_generated' => true,
        ]);
        broadcast(new MessageEvent($channel, $message->load([
            'files',
            'reactions',

        ])->loadCount('threadMessages')));
        return $message;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Channel extends Model
{
    static $type = ['PUBLIC', 'PRIVATE', 'DIRECT', 'SELF'];

    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'type',
        'workspace_id',
        'user_id'
    ];
    public static function createChannelDescription($type, $channelName)
    {
        switch ($type) {
            case 'all':
                return 'Share announcements and updates about company news, upcoming events, or teammates who deserve some kudos.';
            case 'social':
                return "Other channels are for work. This one’s just for fun. Get to know your teammates and show your lighter side. 🎈";

            default:
                return "This channel is for everything #".$channelName.". Hold meetings, share docs, and make decisions together with your team.";
        }
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}

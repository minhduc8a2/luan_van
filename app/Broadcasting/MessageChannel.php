<?php

namespace App\Broadcasting;

use App\Models\User;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Support\Facades\DB;
use Illuminate\Broadcasting\PresenceChannel;

class MessageChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct(public Channel $channel)
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, Channel $channel): array|bool
    {
        if ($user->isChannelMember($channel))
            return ['id' => $user->id, 'name' => $user->name, 'avatar_url' => $user->avatar_url];
        return false;
    }

    
}

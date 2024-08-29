<?php

namespace App\Broadcasting;

use App\Models\Channel;
use App\Models\User;

class HuddleChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, Channel $channel): array|bool
    {
        if ($user->isChannelMember($channel))
            return ['id' => $user->id, 'name' => $user->name];
        return false;
    }
}

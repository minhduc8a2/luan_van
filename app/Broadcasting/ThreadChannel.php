<?php

namespace App\Broadcasting;

use App\Models\User;

use App\Models\Channel;
use App\Models\Message;

class ThreadChannel
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
    public function join(User $user, Message $message): array|bool
    {
        try {
            $channel = $message->channel;
            if ($user->can('viewThread', [Message::class, $channel]))
                return ['id' => $user->id, 'name' => $user->name, 'avatar_url' => $user->avatar_url];
        } catch (\Throwable $th) {
        }
        return false;
    }
}

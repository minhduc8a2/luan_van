<?php

namespace App\Broadcasting;

use App\Models\User;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Support\Facades\DB;
use Illuminate\Broadcasting\PrivateChannel;

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
        $exists = DB::table('channel_user')
            ->where('user_id', '=', $user->id)
            ->where('channel_id', '=', $channel->id)
            ->count() > 0;
        return true;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channels.' . $this->channel->id),
        ];
    }
  
}

<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Channel;
use App\Helpers\PermissionTypes;
use App\Models\Reaction;

class ReactionPolicy
{
    public function create(User $user, Channel $channel): bool
    {
        if ($channel->is_archived) return false;
        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_CHAT->name);
    }

    public function delete(User $user, Channel $channel, Reaction $reaction): bool
    {
        if ($channel->is_archived) return false;
        if ($reaction->user_id != $user->id) return false;
        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_CHAT->name);
    }
}

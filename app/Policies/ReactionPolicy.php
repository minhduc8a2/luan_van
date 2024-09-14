<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Channel;
use App\Helpers\ChannelTypes;
use App\Helpers\PermissionTypes;


class ReactionPolicy
{
    public function create(User $user, Channel $channel): bool
    {
        if ($channel->is_archived) return false;
        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name);
    }

    public function delete(User $user, Channel $channel): bool
    {
        if ($channel->is_archived) return false;
        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name);
    }
}

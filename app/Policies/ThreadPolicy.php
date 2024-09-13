<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Channel;
use App\Helpers\ChannelTypes;
use App\Helpers\PermissionTypes;
use Illuminate\Support\Facades\DB;

class ThreadPolicy
{
    /**
     * Create a new policy instance.
     */
    public function view(User $user, Channel $channel): bool
    {
        if ($channel->type == ChannelTypes::PUBLIC->name) {
            if (
                $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
                || $user->channelPermissionCheck($channel->workspace->mainChannel(), PermissionTypes::CHANNEL_VIEW->name)
            )
                return true;
        }
        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name);
    }
}

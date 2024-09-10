<?php

namespace App\Policies;

use App\Helpers\ChannelTypes;
use App\Helpers\PermissionTypes;
use App\Models\User;
use App\Models\Channel;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Access\Response;

class ChannelPolicy
{

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool {}

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Channel $channel): bool
    {
        if ($channel->type == ChannelTypes::PUBLIC->name) {
            return $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
                || $user->channelPermissionCheck($channel->workspace->mainChannel(), PermissionTypes::CHANNEL_VIEW->name)
                || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name);
        }
        return $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Workspace $workspace): bool
    {
        return $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->workspacePermissionCheck($workspace, PermissionTypes::CREATE_CHANNEL->name);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function updateDescription(User $user, Channel $channel): bool
    {
        return $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_EDIT_DESCRIPTION->name);
    }

    public function updateName(User $user, Channel $channel): bool
    {

        return $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_EDIT_NAME->name);
    }
    public function changeType(User $user, Channel $channel): bool
    {
        return $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name);
    }

    public function leave(User $user, Channel $channel): bool
    {
        return $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Channel $channel): bool
    {
        return $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Channel $channel): bool
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Channel $channel): bool
    {
        //
    }
}

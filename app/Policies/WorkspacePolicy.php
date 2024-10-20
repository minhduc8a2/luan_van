<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;
use App\Helpers\ChannelTypes;
use App\Helpers\PermissionTypes;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Access\Response;

class WorkspacePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool {}

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Workspace $workspace): bool
    {
        
        $channel = $workspace->mainChannel();
        return $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    public function changeMemberRole(User $user, Workspace $workspace): bool
    {
        return $user->id == $workspace->user_id;
    }
    public function deactivateUser(User $user, Workspace $workspace): bool
    {
        return $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name);
    }
    public function acceptJoiningRequest(User $user, Workspace $workspace): bool
    {
        return $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name);
    }
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Workspace $workspace): bool
    {
        return $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name);
    }
    public function viewInvitations(User $user, Workspace $workspace): bool
    {
        return $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Workspace $workspace): bool
    {

        return $user->id==$workspace->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Workspace $workspace): bool
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Workspace $workspace): bool
    {
        //
    }
}
